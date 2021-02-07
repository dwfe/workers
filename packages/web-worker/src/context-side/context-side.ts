import {fromEvent, merge, Observable, Subject} from 'rxjs'
import {map, shareReplay, takeUntil, tap} from 'rxjs/operators'
import {Ctx, CtxType, IConverter, IMessagePost} from './contract'

export class ContextSide<TSend = any, TPost = any, TRead = any, TReceived = any> {

  private sender = new Subject<TSend>()
  private stopper = new Subject()
  private ctxType!: CtxType
  private isDebug = false

  constructor(public readonly id: string,
              public readonly ctx: Ctx,
              public readonly converter: IConverter<TSend, TPost, TRead, TReceived>) {
    this.init()
  }

  send(data: TSend) {
    this.sender.next(data)
  }

  private send$ = this.sender.asObservable().pipe(
    tap(d => this.log('to converter.write', d)),
    map(d => this.converter.write(d)),        // TSend -> TPost
    tap(data => this.log('to postMessage', data)),
    tap(data => this.postMessage(data)),
  )

  received$: Observable<TReceived> = fromEvent<MessageEvent<TRead>>(this.ctx, 'message').pipe(
    tap(event => this.log('to converter.read', event.data)),
    map(event => this.converter.read(event)), // TRead -> TReceived
    tap(data => this.log('to received', data)),
    shareReplay(1),
  )

  private error$ = fromEvent<MessageEvent>(this.ctx, 'messageerror').pipe(
    tap(event => this.error('messageerror', event)),
  )

  private start$ = merge(
    this.send$,
    this.error$,
  ).pipe(
    takeUntil(this.stopper.asObservable())
  )

  stop() {
    this.log('stopping...');
    this.stopper.next(true);
    this.stopper.complete();
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

  private async postMessage(data: IMessagePost<TPost>): Promise<void> {
    switch (this.ctxType) {
      /**
       * ServiceWorkerContainer has no 'postMessage' method.
       * But ServiceWorkerContainer.controller may not have been initialized yet.
       */
      case CtxType.ServiceWorkerContainer: {
        if ((this.ctx as ServiceWorkerContainer).controller?.postMessage)
          ((this.ctx as ServiceWorkerContainer).controller?.postMessage)?.(data.message, data.transfer)
        else
          throw new Error(`${this.logPrefix} is missing a method 'postMessage'`)
        break;
      }
      case CtxType.ServiceWorkerGlobalScope: {
        const clients = await (this.ctx as ServiceWorkerGlobalScope).clients.matchAll({includeUncontrolled: true})
        clients.forEach(client => client.postMessage(data.message, data.transfer))
        break;
      }
      default:
        // @ts-ignore
        this.ctx.postMessage(data.message, data.transfer)
    }
  }

  setDebug(value: boolean) {
    this.isDebug = value
  }

  logPrefix = `ctx[${this.id}]:`

  log(...args) {
    if (this.isDebug)
      console.log(this.logPrefix, ...args)
  }

  error(...args) {
    console.error(this.logPrefix, ...args)
  }

//endregion

}
