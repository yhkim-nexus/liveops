"use client";

import { useState } from "react";

interface DevicePreviewFrameProps {
  title: string;
  body: string;
  imageUrl?: string | null;
  appName?: string;
}

type DeviceTab = "ios" | "android";

export function DevicePreviewFrame({
  title,
  body,
  imageUrl,
  appName = "LiveOps",
}: DevicePreviewFrameProps) {
  const [activeTab, setActiveTab] = useState<DeviceTab>("ios");

  const isEmpty = !title && !body;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* OS 탭 스위처 */}
      <div className="flex rounded-lg border bg-muted p-1 text-xs">
        <button
          onClick={() => setActiveTab("ios")}
          className={`rounded-md px-3 py-1 font-medium transition-colors ${
            activeTab === "ios"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          iOS
        </button>
        <button
          onClick={() => setActiveTab("android")}
          className={`rounded-md px-3 py-1 font-medium transition-colors ${
            activeTab === "android"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Android
        </button>
      </div>

      {/* 폰 프레임 */}
      <div className="w-[280px] rounded-[2rem] border-2 border-gray-300 bg-gray-50 shadow-xl overflow-hidden">
        {/* 상단 노치/인디케이터 */}
        <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
          <span className="text-white text-xs font-medium">9:41</span>
          <div
            className={`${activeTab === "ios" ? "w-16 h-4 bg-gray-800 rounded-full" : "w-3 h-3 bg-gray-800 rounded-full"}`}
          />
          <div className="flex items-center gap-1">
            {/* 배터리 아이콘 플레이스홀더 */}
            <span className="text-white text-xs">100%</span>
          </div>
        </div>

        {/* 화면 영역 */}
        <div className="bg-gray-100 min-h-[380px] p-3">
          {isEmpty ? (
            <div className="flex items-center justify-center h-40 text-center">
              <p className="text-xs text-muted-foreground px-4">
                메시지를 입력하면 미리보기가 표시됩니다
              </p>
            </div>
          ) : (
            /* 알림 카드 */
            <div
              className={`w-full bg-white p-3 shadow-sm ${activeTab === "android" ? "rounded-lg" : "rounded-xl"}`}
            >
              {/* 앱 헤더 */}
              <div className="flex items-center gap-2 mb-2">
                {/* 앱 아이콘 플레이스홀더 */}
                <div className="w-5 h-5 rounded-[4px] bg-indigo-500 flex-shrink-0" />
                <span className="text-xs text-gray-500 font-medium flex-1 truncate">
                  {appName}
                </span>
                <span className="text-xs text-gray-400">now</span>
              </div>

              {/* 알림 본문 */}
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                    {title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                    {body}
                  </p>
                </div>

                {/* 이미지 썸네일 */}
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="notification thumbnail"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* 홈 인디케이터 */}
        <div className="bg-gray-100 pb-2 flex justify-center">
          <div className="w-24 h-1 bg-gray-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}
