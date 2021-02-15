import { CacheItem } from "./cache.item";

export type TGetFromCacheStrategy = "cache || fetch -> cache";
export type TCacheCleanStrategy = "not-controlled";

export interface ICacheContainer {
  item(pathname: string): CacheItem;

  items(): CacheItem[];

  info(): Promise<any>;

  isControl(url: URL): boolean;
}

export type MessageType = "GET_INFO" | "INFO" | "RELOAD_PAGE";
export interface IMessageEvent extends ExtendableMessageEvent {
  data: {
    type: MessageType;
    data: any;
  };
}
