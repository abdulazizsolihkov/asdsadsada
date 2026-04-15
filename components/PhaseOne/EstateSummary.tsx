'use client';

interface Props {
  grossAmount: number;
  burialExpenses: number;
  debtsTopeople: number;
  religiousDebts: number;
  netAmount: number;
  bequest: number;
  bequestCapped: boolean;
  finalAmount: number;
}

function fmt(n: number) {
  return n.toLocaleString('uz-UZ');
}

export function EstateSummary({ grossAmount, burialExpenses, debtsTopeople, religiousDebts, netAmount, bequest, bequestCapped, finalAmount }: Props) {
  return (
    <div className="bg-emerald-50 rounded-xl p-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Jami mulk</span>
        <span className="font-medium">{fmt(grossAmount)}</span>
      </div>
      {burialExpenses > 0 && (
        <div className="flex justify-between text-red-600">
          <span>− Kafanlik/Dafn</span>
          <span>{fmt(burialExpenses)}</span>
        </div>
      )}
      {debtsTopeople > 0 && (
        <div className="flex justify-between text-red-600">
          <span>− Qarzlar (insonga)</span>
          <span>{fmt(debtsTopeople)}</span>
        </div>
      )}
      {religiousDebts > 0 && (
        <div className="flex justify-between text-red-600">
          <span>− Diniy qarzlar</span>
          <span>{fmt(religiousDebts)}</span>
        </div>
      )}
      <div className="border-t border-emerald-200 pt-2 flex justify-between font-semibold">
        <span>Sof miqdor</span>
        <span>{fmt(netAmount)}</span>
      </div>
      {bequest > 0 && (
        <div className="flex justify-between text-amber-700">
          <span>
            − Vasiyat
            {bequestCapped && <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">cheklangan</span>}
          </span>
          <span>{fmt(bequest)}</span>
        </div>
      )}
      <div className="border-t-2 border-emerald-400 pt-2 flex justify-between text-emerald-700 font-bold text-base">
        <span>Taqsimlash uchun</span>
        <span>{fmt(finalAmount)}</span>
      </div>
    </div>
  );
}
