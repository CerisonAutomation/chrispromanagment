import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaxReport {
  year: string;
  totalRevenue: number;
  vatAmount: number;
  netIncome: number;
}

export default function TaxReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [report, setReport] = useState<TaxReport | null>(null);

  const generateReport = () => {
    setReport({
      year,
      totalRevenue: 125000,
      vatAmount: 18750,
      netIncome: 106250,
      bookings: 145,
      averageStay: 4.2
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tax Reports</h1>
      <div className="flex gap-4 mb-6">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={generateReport}>Generate Report</Button>
        {report && <Button variant="outline">Export PDF</Button>}
      </div>
      {report && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-sm font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold">€{report.totalRevenue}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium">VAT (15%)</h3>
            <p className="text-3xl font-bold">€{report.vatAmount}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium">Net Income</h3>
            <p className="text-3xl font-bold">€{report.netIncome}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium">Total Bookings</h3>
            <p className="text-3xl font-bold">{report.bookings}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium">Avg Stay (nights)</h3>
            <p className="text-3xl font-bold">{report.averageStay}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
