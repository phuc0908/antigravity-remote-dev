import { useState, useEffect } from 'react';
import { getVapidKey, subscribePush, unsubscribePush } from '../services/api';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    arr[i] = rawData.charCodeAt(i);
  }
  return arr.buffer as ArrayBuffer;
}

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sw = 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(sw);
    if (sw) {
      navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      }).catch(() => {});
    }
  }, []);

  const toggle = async () => {
    if (!supported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
        await unsubscribePush(existing.endpoint);
        setSubscribed(false);
      } else {
        const { publicKey } = await getVapidKey();
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        await subscribePush(sub.toJSON() as PushSubscriptionJSON);
        setSubscribed(true);
      }
    } catch (err) {
      console.error('Push toggle failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return { supported, subscribed, loading, toggle };
}
