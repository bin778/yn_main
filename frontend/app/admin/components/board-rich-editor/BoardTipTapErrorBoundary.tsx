'use client';

import { Component, type ReactNode } from 'react';

type BoardTipTapErrorBoundaryProps = {
  children: ReactNode;
  onForceLegacyMode: () => void;
};

type BoardTipTapErrorBoundaryState = {
  hasError: boolean;
};

export default class BoardTipTapErrorBoundary extends Component<
  BoardTipTapErrorBoundaryProps,
  BoardTipTapErrorBoundaryState
> {
  state: BoardTipTapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoardTipTapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('TipTap 에디터 오류, 레거시 HTML 모드로 전환합니다.', error);
    this.props.onForceLegacyMode();
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="rounded border border-[#d6e4ff] bg-[#f0f5ff] px-3 py-4 text-sm text-[#1a3151]">
          복잡한 HTML 본문이라 기본 편집기를 사용할 수 없습니다. 레거시 HTML 모드로 전환합니다…
        </p>
      );
    }

    return this.props.children;
  }
}
