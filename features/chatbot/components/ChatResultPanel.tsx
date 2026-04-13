"use client";

import React from "react";
import { Empty, Tabs } from "antd";

import { ChatResultPreview } from "@/features/chatbot/components/ChatResultPreview";
import { ChatVisualizationPanel } from "@/features/chatbot/components/ChatVisualizationPanel";
import type {
  ChatResultPreview as ChatResultPreviewType,
  ChatVisualizationConfig,
} from "@/features/chatbot/types";

interface ChatResultPanelProps {
  resultPreview: ChatResultPreviewType | null;
  visualization: ChatVisualizationConfig | null;
  chartOptions: ChatVisualizationConfig[];
  chartPrompt: string | null;
  selectedChartType?: string | null;
  onSelectChartType?: (type: string) => void;
  isSavingChart?: boolean;
}

export function ChatResultPanel({
  resultPreview,
  visualization,
  chartOptions,
  chartPrompt,
  selectedChartType,
  onSelectChartType,
  isSavingChart,
}: ChatResultPanelProps) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Tabs
        defaultActiveKey="result"
        className="chatbot-result-tabs h-full"
        items={[
          {
            key: "result",
            label: "Result",
            children: resultPreview ? (
              <ChatResultPreview preview={resultPreview} embedded />
            ) : (
              <div className="p-6">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No result preview returned yet"
                />
              </div>
            ),
          },
          {
            key: "visualization",
            label: "Visualization",
            children: (
              <ChatVisualizationPanel
                visualization={visualization}
                chartOptions={chartOptions}
                chartPrompt={chartPrompt}
                resultPreview={resultPreview}
                selectedChartType={selectedChartType}
                onSelectChartType={onSelectChartType}
                isSaving={isSavingChart}
                embedded
              />
            ),
          },
        ]}
      />

      <style jsx global>{`
        .chatbot-result-tabs .ant-tabs-nav {
          margin: 0;
          padding: 0 16px;
        }
        .chatbot-result-tabs .ant-tabs-content-holder,
        .chatbot-result-tabs .ant-tabs-tabpane {
          min-width: 0;
        }
        .chatbot-result-tabs .ant-tabs-content-holder {
          overflow: auto;
        }
        @media (min-width: 640px) {
          .chatbot-result-tabs .ant-tabs-nav {
            padding: 0 20px;
          }
        }
      `}</style>
    </section>
  );
}
