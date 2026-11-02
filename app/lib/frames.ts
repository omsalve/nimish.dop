"use client";

import { previewUrl } from "./cloudinary";
import { photographs } from "./collection";

type Listener = (index: number, ok: boolean) => void;

export type FrameStore = {
  urls: string[];
  images: HTMLImageElement[];
  /** 0 pending, 1 loaded, 2 failed */
  state: number[];
  loaded: number;
  listeners: Listener[];
  saveData: boolean;
};

declare global {
  interface Window {
    __nimishFrames?: FrameStore;
  }
}

/** The preview store started by the boot script, or a fresh one on soft navigation. */
export function frameStore(): FrameStore {
  if (window.__nimishFrames) return window.__nimishFrames;
  const store: FrameStore = {
    urls: [],
    images: [],
    state: [],
    loaded: 0,
    listeners: [],
    saveData: false,
  };
  window.__nimishFrames = store;
  photographs.forEach((photo, index) => {
    const image = new Image();
    store.urls[index] = previewUrl(photo.src);
    store.images[index] = image;
    store.state[index] = 0;
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => settle(store, index, true);
    image.onerror = () => settle(store, index, false);
    image.src = store.urls[index];
  });
  return store;
}

function settle(store: FrameStore, index: number, ok: boolean) {
  if (store.state[index]) return;
  store.state[index] = ok ? 1 : 2;
  store.loaded++;
  store.listeners.forEach((listener) => listener(index, ok));
}

export function onFrame(listener: Listener) {
  const store = frameStore();
  store.listeners.push(listener);
  return () => {
    store.listeners = store.listeners.filter((item) => item !== listener);
  };
}

/** Starts any preview the boot script deferred (Save-Data), returning its element. */
export function requestFrame(index: number) {
  const store = frameStore();
  const image = store.images[index];
  if (image && !image.getAttribute("src") && store.state[index] === 0) {
    image.src = store.urls[index];
  }
  return image;
}

export function loadedFrame(index: number) {
  const store = frameStore();
  return store.state[index] === 1 ? store.images[index] : null;
}
