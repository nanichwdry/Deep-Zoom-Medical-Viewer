import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fromEvent, merge, animationFrameScheduler } from 'rxjs';
import { map, switchMap, takeUntil, tap, distinctUntilChanged, observeOn } from 'rxjs/operators';
import { Point, ViewState } from '../types';

export function useDeepZoom(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: { disabled?: boolean } = {}
) {
  const [viewState, setViewState] = useState<ViewState>({
    offset: { x: 0, y: 0 },
    scale: 1,
  });

  const stateRef = useRef<ViewState>(viewState);
  stateRef.current = viewState;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prevent default touch/wheel behavior
    const preventDefault = (e: Event) => e.preventDefault();
    canvas.addEventListener('wheel', preventDefault, { passive: false });
    canvas.addEventListener('touchstart', preventDefault, { passive: false });

    // Panning Logic
    const mouseDown$ = fromEvent<MouseEvent>(canvas, 'mousedown');
    const mouseMove$ = fromEvent<MouseEvent>(window, 'mousemove');
    const mouseUp$ = fromEvent<MouseEvent>(window, 'mouseup');

    const pan$ = mouseDown$.pipe(
      map(e => ({ e, disabled: options.disabled })),
      switchMap(({ e, disabled }) => {
        if (disabled) return [];
        const startOffset = stateRef.current.offset;
        const startPos = { x: e.clientX, y: e.clientY };

        return mouseMove$.pipe(
          map((moveEvent) => ({
            x: startOffset.x + (moveEvent.clientX - startPos.x),
            y: startOffset.y + (moveEvent.clientY - startPos.y),
          })),
          takeUntil(mouseUp$)
        );
      })
    );

    // Zooming Logic (Wheel)
    const wheel$ = fromEvent<WheelEvent>(canvas, 'wheel').pipe(
      map((e) => {
        if (options.disabled) return null;
        const delta = -e.deltaY;
        const factor = Math.pow(1.1, delta / 100);
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const currentScale = stateRef.current.scale;
        const newScale = Math.min(Math.max(currentScale * factor, 0.1), 50);
        
        // Calculate new offset to zoom towards mouse position
        const dx = (mouseX - stateRef.current.offset.x) / currentScale;
        const dy = (mouseY - stateRef.current.offset.y) / currentScale;

        return {
          scale: newScale,
          offset: {
            x: mouseX - dx * newScale,
            y: mouseY - dy * newScale,
          }
        };
      })
    );

    const subscription = merge(
      pan$.pipe(map(offset => ({ ...stateRef.current, offset }))),
      wheel$
    ).pipe(
      observeOn(animationFrameScheduler),
      map(state => state || stateRef.current), // Handle null from wheel$
      distinctUntilChanged((prev, curr) => 
        prev.scale === curr.scale && 
        prev.offset.x === curr.offset.x && 
        prev.offset.y === curr.offset.y
      )
    ).subscribe(newState => {
      setViewState(newState);
    });

    return () => {
      subscription.unsubscribe();
      canvas.removeEventListener('wheel', preventDefault);
      canvas.removeEventListener('touchstart', preventDefault);
    };
  }, [canvasRef, options.disabled]);

  const resetView = useCallback((containerWidth: number, containerHeight: number, imgWidth: number, imgHeight: number) => {
    const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight) * 0.9;
    setViewState({
      scale,
      offset: {
        x: (containerWidth - imgWidth * scale) / 2,
        y: (containerHeight - imgHeight * scale) / 2,
      }
    });
  }, []);

  return { viewState, resetView };
}
