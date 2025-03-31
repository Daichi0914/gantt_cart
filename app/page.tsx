import GanttChart from "@/components/pages/gantt-chart"
import RootLayout from '@/app/layout';

export default function Home() {
  return (
    <RootLayout>
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">ガントチャート</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <GanttChart />
        </div>
      </main>
    </RootLayout>
  )
}
