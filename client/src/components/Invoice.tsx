import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, Printer, Sprout } from "lucide-react";
import type { Order } from "@/lib/types";
import { useApp } from "@/context/AppContext";

interface InvoiceProps {
  order: Order;
  vendorId: string;
  onClose: () => void;
}

export default function Invoice({ order, vendorId, onClose }: InvoiceProps) {
  const { users } = useApp();
  const vendor = users.find((u) => u.id === vendorId);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  const myItems = useMemo(
    () => order.items.filter((i) => i.vendorId === vendorId),
    [order, vendorId]
  );

  const subtotal = useMemo(
    () => myItems.reduce((s, i) => s + i.price * i.qty, 0),
    [myItems]
  );

  // Vendor-share of tax & shipping is prorated by their subtotal.
  const totalSub = order.subtotal || 1;
  const share = subtotal / totalSub;
  const tax = +(order.tax * share).toFixed(2);
  const shipping = +(order.shipping * share).toFixed(2);
  const grandTotal = +(subtotal + tax + shipping).toFixed(2);

  const invoiceNumber = `AM-${new Date(order.createdAt).getFullYear()}-${order.id.slice(-6).toUpperCase()}`;

  // Generate QR code containing invoice metadata
  useEffect(() => {
    const payload = JSON.stringify({
      invoice: invoiceNumber,
      order: order.id,
      vendor: vendor?.storeName || vendor?.name || "Vendor",
      customer: order.customerName,
      total: grandTotal,
      currency: "USD",
      date: new Date(order.createdAt).toISOString(),
      verify: `https://aislemind.co/verify/${order.id}`,
    });
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [order, vendor, invoiceNumber, grandTotal]);

  const downloadHtml = () => {
    if (!printRef.current) return;
    const styles = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#1a1a1a;background:#f5f5f0;padding:24px}
      .invoice{max-width:820px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08)}
      .head{background:linear-gradient(135deg,#1d5e34 0%,#2a7d4a 100%);color:#fff;padding:36px 40px;display:flex;justify-content:space-between;align-items:flex-start;gap:24px}
      .brand{display:flex;align-items:center;gap:12px}
      .logo{width:48px;height:48px;background:rgba(255,255,255,.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px}
      .brand h1{font-size:24px;font-weight:700;letter-spacing:-.02em}
      .brand p{font-size:12px;opacity:.85}
      .head .meta{text-align:right;font-size:12px}
      .head .meta .label{opacity:.75;text-transform:uppercase;letter-spacing:.08em;font-size:10px}
      .head .meta .num{font-size:18px;font-weight:700;font-family:'JetBrains Mono',monospace;margin-top:4px}
      .badge{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:4px 12px;font-size:11px;font-weight:600;margin-top:8px;text-transform:uppercase;letter-spacing:.05em}
      .body{padding:36px 40px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px}
      .card{background:#f9faf7;border:1px solid #e7e9e2;border-radius:12px;padding:18px}
      .card h3{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#1d5e34;font-weight:700;margin-bottom:8px}
      .card .name{font-weight:700;font-size:15px;margin-bottom:4px}
      .card .lines{font-size:13px;color:#555;line-height:1.55}
      table{width:100%;border-collapse:collapse;margin-bottom:24px}
      thead{background:#1d5e34;color:#fff}
      th{text-align:left;padding:12px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
      th.right,td.right{text-align:right}
      td{padding:14px;border-bottom:1px solid #eee;font-size:14px;vertical-align:top}
      td.item-name{font-weight:600}
      td.item-name .opts{display:block;font-size:11px;color:#888;margin-top:2px;font-weight:400}
      .totals{display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:flex-start}
      .qr-wrap{background:#f9faf7;border:1px solid #e7e9e2;border-radius:12px;padding:16px;text-align:center}
      .qr-wrap img{width:140px;height:140px;display:block;margin:0 auto 8px}
      .qr-wrap .label{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.08em;font-weight:600}
      .totals-table{width:100%;font-size:14px}
      .totals-table tr td{padding:8px 0;border:none}
      .totals-table tr td:last-child{text-align:right;font-weight:600}
      .totals-table tr.grand td{padding-top:14px;border-top:2px solid #1d5e34;font-size:18px;color:#1d5e34;font-weight:700}
      .pay{margin-top:28px;padding:14px 18px;background:#1d5e34;color:#fff;border-radius:10px;display:flex;justify-content:space-between;align-items:center;font-size:13px}
      .pay .l{opacity:.85;text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:600}
      .pay .v{font-weight:700;margin-top:2px}
      .footer{padding:24px 40px;background:#f9faf7;border-top:1px solid #e7e9e2;text-align:center;font-size:11px;color:#888;line-height:1.6}
      .footer strong{color:#1d5e34}
      @media print{body{background:#fff;padding:0}.invoice{box-shadow:none;border-radius:0}}
    `;
    const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>Invoice ${invoiceNumber}</title>
<style>${styles}</style></head><body>${printRef.current.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const print = () => {
    const w = window.open("", "_blank");
    if (!w || !printRef.current) return;
    const styles = document.createElement("style");
    // pull the same styles by re-using the download path's style block via a quick render
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Invoice ${invoiceNumber}</title></head><body></body></html>`);
    w.document.body.innerHTML = printRef.current.outerHTML;
    // Inject minimal print styling
    const s = w.document.createElement("style");
    s.textContent = `body{font-family:'DM Sans',sans-serif;margin:0;padding:0;background:#fff}`;
    w.document.head.appendChild(s);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 250);
  };

  return (
    <div>
      <DialogHeader className="px-6 pt-6 pb-3 bg-background border-b border-border">
        <DialogTitle className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" /> Invoice preview
        </DialogTitle>
        <DialogDescription>
          Real invoice with QR verification. Download or print for your records.
        </DialogDescription>
      </DialogHeader>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-2 px-6 py-3 bg-background border-b border-border sticky top-0 z-10">
        <Button variant="outline" size="sm" onClick={print}>
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button variant="hero" size="sm" onClick={downloadHtml}>
          <Download className="h-4 w-4" /> Download
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>

      {/* Invoice document */}
      <div className="p-4 sm:p-6 md:p-8 bg-muted/30">
        <div ref={printRef} className="invoice mx-auto bg-white rounded-2xl overflow-hidden shadow-elegant max-w-[820px]">
          {/* Header */}
          <div
            className="head text-white px-6 sm:px-10 py-7 sm:py-9 flex flex-col sm:flex-row justify-between items-start gap-5"
            style={{ background: "linear-gradient(135deg,#1d5e34 0%,#2a7d4a 100%)" }}
          >
            <div className="brand flex items-center gap-3">
              <div
                className="logo h-12 w-12 flex items-center justify-center rounded-xl text-2xl"
                style={{ background: "rgba(255,255,255,.15)" }}
              >
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Aislemind</h1>
                <p className="text-xs opacity-85 mt-0.5">Considered objects · marketplace</p>
              </div>
            </div>
            <div className="meta text-left sm:text-right">
              <p className="label text-[10px] uppercase tracking-wider opacity-75 font-semibold">Tax invoice</p>
              <p className="num text-base sm:text-lg font-bold font-mono mt-1">{invoiceNumber}</p>
              <p className="text-xs opacity-85 mt-1">
                Issued · {new Date(order.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </p>
              <span
                className="badge inline-block mt-2 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider"
                style={{ background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.3)" }}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="body p-6 sm:p-10">
            {/* From / Bill to */}
            <div className="grid grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <div className="card bg-[hsl(75_18%_96%)] border border-[hsl(75_15%_88%)] rounded-xl p-4 sm:p-5">
                <h3 className="text-[10px] uppercase tracking-wider text-primary font-bold mb-2">From · Vendor</h3>
                <p className="name font-bold text-[15px] mb-1">{vendor?.storeName || vendor?.name}</p>
                <div className="lines text-[13px] text-muted-foreground leading-relaxed">
                  <p>{vendor?.name}</p>
                  <p>{vendor?.email}</p>
                  <p className="mt-1 text-[11px]">Vendor ID: <span className="font-mono">{vendorId.slice(-10).toUpperCase()}</span></p>
                </div>
              </div>
              <div className="card bg-[hsl(75_18%_96%)] border border-[hsl(75_15%_88%)] rounded-xl p-4 sm:p-5">
                <h3 className="text-[10px] uppercase tracking-wider text-primary font-bold mb-2">Bill to · Customer</h3>
                <p className="name font-bold text-[15px] mb-1">{order.address.fullName}</p>
                <div className="lines text-[13px] text-muted-foreground leading-relaxed">
                  <p>{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                  <p>{order.address.phone}</p>
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead style={{ background: "#1d5e34", color: "#fff" }}>
                  <tr>
                    <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wider">Item</th>
                    <th className="text-right p-3 text-[11px] font-bold uppercase tracking-wider">Qty</th>
                    <th className="text-right p-3 text-[11px] font-bold uppercase tracking-wider">Unit price</th>
                    <th className="text-right p-3 text-[11px] font-bold uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {myItems.map((i, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <td className="item-name p-3 font-semibold">
                        {i.name}
                        {(i.color || i.size) && (
                          <span className="opts block text-[11px] text-muted-foreground font-normal mt-0.5">
                            {i.color && `Color: ${i.color}`}{i.color && i.size && " · "}{i.size && `Size: ${i.size}`}
                          </span>
                        )}
                      </td>
                      <td className="right p-3 text-right">{i.qty}</td>
                      <td className="right p-3 text-right">${i.price.toFixed(2)}</td>
                      <td className="right p-3 text-right font-semibold">${(i.price * i.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & QR */}
            <div className="totals grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 mt-7 items-start">
              <div className="qr-wrap bg-[hsl(75_18%_96%)] border border-[hsl(75_15%_88%)] rounded-xl p-4 text-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Invoice QR" className="w-[140px] h-[140px] mx-auto block" />
                ) : (
                  <div className="w-[140px] h-[140px] mx-auto bg-muted animate-pulse rounded" />
                )}
                <p className="label text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-2">
                  Scan to verify invoice
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono break-all">
                  {invoiceNumber}
                </p>
              </div>

              <div>
                <table className="totals-table w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 text-muted-foreground">Subtotal</td>
                      <td className="py-2 text-right font-semibold">${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">Shipping (prorated)</td>
                      <td className="py-2 text-right font-semibold">${shipping.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">Tax (prorated)</td>
                      <td className="py-2 text-right font-semibold">${tax.toFixed(2)}</td>
                    </tr>
                    <tr className="grand">
                      <td className="pt-3 text-primary font-bold text-base sm:text-lg" style={{ borderTop: "2px solid #1d5e34" }}>
                        Grand total
                      </td>
                      <td className="pt-3 text-right text-primary font-bold text-base sm:text-lg" style={{ borderTop: "2px solid #1d5e34" }}>
                        ${grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div
                  className="pay mt-5 px-4 py-3 rounded-lg flex justify-between items-center text-white"
                  style={{ background: "#1d5e34" }}
                >
                  <div>
                    <p className="l text-[10px] opacity-85 uppercase tracking-wider font-semibold">Payment method</p>
                    <p className="v font-bold mt-0.5">{order.paymentMethod || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="l text-[10px] opacity-85 uppercase tracking-wider font-semibold">Reference</p>
                    <p className="v font-bold mt-0.5 text-[12px]">{order.paymentDetails || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="footer px-10 py-6 text-center text-[11px] text-muted-foreground leading-relaxed border-t border-border"
            style={{ background: "#f9faf7" }}
          >
            Thank you for shopping with <strong className="text-primary">Aislemind</strong>.
            For support, write to <strong className="text-primary">support@aislemind.co</strong>.<br />
            This is a computer-generated invoice and does not require a physical signature.
          </div>
        </div>
      </div>
    </div>
  );
}
