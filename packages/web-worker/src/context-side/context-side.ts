import {fromEvent, map, merge, Observable, shareReplay, SubjectWrap, takeUntil, tap} from '@do-while-for-each/rxjs'
import {Ctx, CtxType, IConverter, IMessagePost} from './contract'

export class ContextSide<TSend = any, TPost = any, TRead = any, TReceived = any> {

  private sender = new SubjectWrap<TSend>()
  private ctxType!: CtxType
  public isDebug = false

  constructor(public readonly id: string,
              public readonly ctx: Ctx,
              public readonly converter: IConverter<TSend, TPost, TRead, TReceived>) {
    this.init()
  }

  send(data: TSend) {
    this.sender.setValue(data)
  }

  private send$ = this.sender.value$.pipe(
    tap(d => this.log('to converter.write', d)),
    map(d => this.converter.write(d)),        // TSend -> TPost
    tap(data => this.log('to postMessage', data)),
    tap(data => this.postMessage(data)),
  )

  received$: Observable<TReceived> = fromEvent<MessageEvent<TRead>>(this.ctx, 'message').pipe(
    takeUntil(this.sender.stopper$),
    tap(event => this.log('to converter.read', event.data)),
    map(event => this.converter.read(event)), // TRead -> TReceived
    tap(data => this.log('to received', data)),
    shareReplay(1),
  )

  private error$ = fromEvent<MessageEvent>(this.ctx, 'messageerror').pipe(
    tap(event => this.logError('messageerror', event)),
  )

  private start$ = merge(
    this.send$,
    this.error$,
  ).pipe(
    takeUntil(this.sender.stopper$)
  )

  stop() {
    this.log('stopping...')
    this.sender.stop()
  }

  terminate() {
    this.stop()
    this.log('terminating...')
    switch (this.ctxType) {
      case CtxType.Worker:
        (this.ctx as Worker).terminate();
        break;
      case CtxType.DedicatedWorkerGlobalScope:
        (this.ctx as DedicatedWorkerGlobalScope).close();
        break;
    }
  }

//region Support

  private init() {
    if (this.ctx instanceof Worker) {
      this.ctxType = CtxType.Worker
    } else if (this.ctx instanceof DedicatedWorkerGlobalScope) {
      this.ctxType = CtxType.DedicatedWorkerGlobalScope
    } else if (this.ctx instanceof ServiceWorkerContainer) {
      this.ctxType = CtxType.ServiceWorkerContainer
    } else if (this.ctx instanceof ServiceWorkerGlobalScope) {
      this.ctxType = CtxType.ServiceWorkerGlobalScope
    } else
      throw new Error(`${this.logPrefix} unknown context type`);
    this.start$.subscribe()
  }

  private async postMessage({message, transfer}: IMessagePost<TPost>): Promise<void> {
    switch (this.ctxType) {
      /**
       * ServiceWorkerContainer has no 'postMessage' method.
       * But ServiceWorkerContainer.controller may not have been initialized yet.
       */
      case CtxType.ServiceWorkerContainer: {
        if ((this.ctx as ServiceWorkerContainer).controller?.postMessage) {
          // @ts-ignore
          (this.ctx as ServiceWorkerContainer).controller.postMessage(message, transfer)
        } else
          this.logError('can\'t send a message, because there is no activated Service Worker')
        break;
      }
      case CtxType.ServiceWorkerGlobalScope: {
        const clients = await (this.ctx as ServiceWorkerGlobalScope).clients.matchAll({includeUncontrolled: false})
        clients.forEach(client => client.postMessage(message, transfer))
        break;
      }
      default: {
        // @ts-ignore
        this.ctx.postMessage(message, transfer)
      }
    }
  }

  logPrefix = `ctx[${this.id}]:`

  log(...args) {
    if (this.isDebug)
      console.log(this.logPrefix, ...args)
  }

  logError(...args) {
    console.error(this.logPrefix, ...args)
  }

//endregion

}
