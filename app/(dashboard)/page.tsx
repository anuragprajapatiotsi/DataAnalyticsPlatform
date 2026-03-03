import { ActivityFeedCard } from "@/features/dashboard/components/activity-feed";
import { DataAssetsCard } from "@/features/dashboard/components/data-assets";
import { DashboardHero } from "@/features/dashboard/components/hero";
import { FollowingAssetsCard } from "@/features/dashboard/components/following-assets-card";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { MyDataCard } from "@/features/dashboard/components/my-data";
import { TotalDataAssetsCard } from "@/features/dashboard/components/total-data-assets-card";

export default function Home() {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6 pb-12 custom-scrollbar animate-in fade-in slide-in-from-bottom-3 duration-500">
      <DashboardHero />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <ActivityFeedCard />
        </div>
        <div className="xl:col-span-4">
          <DataAssetsCard />
        </div>
        <div className="xl:col-span-4">
          <MyDataCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <KpiCard />
        </div>
        <div className="xl:col-span-4">
          <TotalDataAssetsCard />
        </div>
        <div className="xl:col-span-4">
          <FollowingAssetsCard />
        </div>
      </div>
    </div>
  );
}

