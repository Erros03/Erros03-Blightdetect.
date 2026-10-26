/**
 * Client-Side YOLOv11/Roboflow inference function
 * Calls the secure server-side proxy to keep API keys hidden
 */
import type { RoboflowPrediction } from '../types.ts';
import type { DetectionApiResponse } from './roboflow.server.ts';

export interface DetectOptions {
  confidence?: number;
  overlap?: number;
  endpoint?: string;
  signal?: AbortSignal;
}

export interface DetectTomatoesResult {
  predictions: RoboflowPrediction[];
  inferenceTimeMs: number;
  imageWidth: number;
  imageHeight: number;
  source?: string;
  endpoint?: string;
  error?: string;
}

export async function checkRoboflowStatus(): Promise<{
  configured: boolean;
  endpoint: string;
  status: 'connected' | 'error' | 'unconfigured' | 'network_error' | 'credit_limit';
  statusCode?: number;
  workspace?: string;
  message: string;
}> {
  try {
    const res = await fetch('/api/roboflow/status');
    if (!res.ok) {
      return {
        configured: false,
        endpoint: '',
        status: 'error',
        statusCode: res.status,
        message: `Status check returned HTTP ${res.status}`,
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      configured: false,
      endpoint: '',
      status: 'network_error',
      message: err?.message || 'Network error checking Roboflow status',
    };
  }
}

export async function probeLocalEngineDirect(): Promise<{
  online: boolean;
  model?: string;
  latencyMs: number;
}> {
  const t0 = performance.now();
  try {
    const res = await fetch('http://127.0.0.1:5000/detect', {
      method: 'GET',
      signal: AbortSignal.timeout(1200),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        online: true,
        model: data.model || 'local_engine.py',
        latencyMs: Math.round(performance.now() - t0),
      };
    }
  } catch {
    // try localhost alternative
    try {
      const res = await fetch('http://localhost:5000/detect', {
        method: 'GET',
        signal: AbortSignal.timeout(1200),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          online: true,
          model: data.model || 'local_engine.py',
          latencyMs: Math.round(performance.now() - t0),
        };
      }
    } catch {
      // Offline or blocked
    }
  }
  return { online: false, latencyMs: -1 };
}

export async function detectTomatoesFn(
  imageBase64: string,
  options: DetectOptions = {}
): Promise<DetectTomatoesResult> {
  const { confidence = 0.50, overlap = 0.3, endpoint, signal } = options;

  // 1. Try Direct Local Python YOLOv11 Engine (runs on user's machine at 127.0.0.1:5000)
  if (!endpoint || endpoint.includes('127.0.0.1') || endpoint.includes('localhost')) {
    try {
      const localT0 = performance.now();
      const localRes = await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          confidence,
          overlap,
        }),
        signal: signal || AbortSignal.timeout(1500),
      });

      if (localRes.ok) {
        const localData = await localRes.json();
        const rawPredictions = localData.predictions || [];
        return {
          predictions: rawPredictions.map((p: any) => ({
            x: p.x,
            y: p.y,
            width: p.width,
            height: p.height,
            class: p.class || 'Tomato',
            confidence: p.confidence ?? 0.85,
            detection_id: `local_y11_${Math.random().toString(36).slice(2, 8)}`,
          })),
          inferenceTimeMs: Math.round(performance.now() - localT0),
          imageWidth: localData.imageWidth || 640,
          imageHeight: localData.imageHeight || 480,
          source: 'local-yolo11-engine',
          endpoint: 'http://127.0.0.1:5000/detect',
        };
      }
    } catch {
      // Local engine not running or browser blocked; fallback seamlessly to server
    }
  }

  // 2. Server-side proxy detection (Cloud Roboflow or Server pipeline)
  try {
    const response = await fetch('/api/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        confidence,
        overlap,
        endpoint,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Inference server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return {
      predictions: data.predictions || [],
      inferenceTimeMs: data.inferenceTimeMs || 0,
      imageWidth: data.imageWidth || 640,
      imageHeight: data.imageHeight || 480,
      source: data.source,
      endpoint: data.endpoint,
      error: data.error,
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    console.warn('detectTomatoesFn error:', error);
    // Return empty predictions without crashing the continuous stream
    return {
      predictions: [],
      inferenceTimeMs: 0,
      imageWidth: 640,
      imageHeight: 480,
      source: 'client-error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
