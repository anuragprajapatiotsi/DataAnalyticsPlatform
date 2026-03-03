import { ActivityFeedCard } from "@/features/dashboard/components/activity-feed";
import { DataAssetsCard } from "@/features/dashboard/components/data-assets";
import { DashboardHero } from "@/features/dashboard/components/hero";
import { FollowingAssetsCard } from "@/features/dashboard/components/following-assets-card";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { MyDataCard } from "@/features/dashboard/components/my-data";
import { TotalDataAssetsCard } from "@/features/dashboard/components/total-data-assets-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
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

