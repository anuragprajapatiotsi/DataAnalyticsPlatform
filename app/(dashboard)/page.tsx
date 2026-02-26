import { ActivityFeedCard } from "@/components/dashboard/activity-feed";
import { DataAssetsCard } from "@/components/dashboard/data-assets";
import { DashboardHero } from "@/components/dashboard/hero";
import { FollowingAssetsCard } from "@/components/dashboard/following-assets-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MyDataCard } from "@/components/dashboard/my-data";
import { TotalDataAssetsCard } from "@/components/dashboard/total-data-assets-card";

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
