import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Shell from "@/components/layout/Shell";
import OrderStepper from "@/components/OrderStepper";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/StarRating";
import { ArrowLeft, AlertCircle, Undo2, Star } from "lucide-react";

const CANCEL_REASONS = [
  "Found a better price",
  "Ordered by mistake",
  "Delivery taking too long",
  "Changed my mind",
  "Other",
];

export default function OrderDetail() {
  const { id } = useParams();
  const { user, orders, cancelOrder, requestReturn, addReview, reviews } =
    useApp();
  const order = orders.find((o) => o.id === id);

  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelOther, setCancelOther] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  if (!order) {
    return (
      <Shell>
        <div className="container py-20 text-center">
          <p>Order not found.</p>
          <Button asChild className="mt-4">
            <Link to="/orders">Back</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const canCancel = ["Placed", "Dispatched", "Shipped"].includes(order.status);
  const isDelivered = order.status === "Delivered";
  const canReview =
    isDelivered &&
    !reviews.some(
      (r) => r.orderId === order.id && r.customerId === order.customerId,
    );

  const submitCancel = () => {
    const reason = cancelReason === "Other" ? cancelOther : cancelReason;
    if (!reason.trim()) return;
    cancelOrder(order.id, "customer", reason);
    setCancelOpen(false);
  };
  const submitReturn = () => {
    if (!returnReason.trim()) return;
    requestReturn(order.id, returnReason);
    setReturnOpen(false);
    setReturnReason("");
  };

  // Invoice generation moved to vendor dashboard.

  return (
    <Shell>
      <div className="container py-6 md:py-8 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-5 md:mb-6">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4" /> All orders
          </Link>
        </Button>

        {/* Vendor cancellation banner */}
        {order.cancellation?.by === "vendor" && (
          <div className="mb-6 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive mt-0.5 shrink-0" />
              <div>
                <h2 className="font-bold text-base sm:text-lg text-destructive">
                  Sorry for the cancellation
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  The vendor cancelled this order with the following reason:
                </p>
                <p className="mt-2 italic text-foreground text-sm">
                  "{order.cancellation.reason}"
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <p className="font-mono text-[10px] sm:text-xs text-muted-foreground break-all">
              #{order.id.toUpperCase()}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              Order details
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              For{" "}
              <span className="font-semibold text-foreground">
                {order.customerName}
              </span>{" "}
              · placed {new Date(order.createdAt).toLocaleString()}
            </p>
            {order.paymentMethod && (
              <p className="text-xs text-muted-foreground mt-1">
                Paid via{" "}
                <span className="font-semibold text-foreground">
                  {order.paymentMethod}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 md:mb-8 overflow-x-auto">
          <OrderStepper status={order.status} timeline={order.timeline} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-bold text-lg mb-2">Items</h2>
            {order.items.map((i) => (
              <div
                key={i.productId + (i.color || "") + (i.size || "")}
                className="flex gap-4 p-4 rounded-xl border-2 border-border bg-card"
              >
                <img
                  src={i.image}
                  alt={i.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <Link
                    to={`/product/${i.productId}`}
                    className="font-semibold hover:text-primary"
                  >
                    {i.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    by {i.vendorName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qty {i.qty} {i.color && `· ${i.color}`}{" "}
                    {i.size && `· ${i.size}`}
                  </p>
                </div>
                <p className="font-bold text-primary">
                  ₹{(i.price * i.qty).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border-2 border-border bg-card p-5">
              <h3 className="font-bold mb-3">Summary</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 border-border bg-card p-5">
              <h3 className="font-bold mb-2">Shipping to</h3>
              <p className="text-sm font-semibold">{order.address.fullName}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {order.address.street}
                <br />
                {order.address.city}, {order.address.state} {order.address.zip}
                <br />
                {order.address.phone}
              </p>
            </div>

            <div className="space-y-2">
              {canCancel && user?.role === "customer" && (
                <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Cancel order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel this order?</DialogTitle>
                      <DialogDescription>
                        Help us improve — what's the reason?
                      </DialogDescription>
                    </DialogHeader>
                    <RadioGroup
                      value={cancelReason}
                      onValueChange={setCancelReason}
                      className="space-y-2 my-2"
                    >
                      {CANCEL_REASONS.map((r) => (
                        <div key={r} className="flex items-center gap-2">
                          <RadioGroupItem value={r} id={r} />
                          <Label
                            htmlFor={r}
                            className="font-normal cursor-pointer"
                          >
                            {r}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {cancelReason === "Other" && (
                      <Input
                        placeholder="Please specify…"
                        value={cancelOther}
                        onChange={(e) => setCancelOther(e.target.value)}
                      />
                    )}
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        onClick={() => setCancelOpen(false)}
                      >
                        Keep order
                      </Button>
                      <Button variant="destructive" onClick={submitCancel}>
                        Confirm cancellation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {isDelivered &&
                !order.returnRequest &&
                user?.role === "customer" && (
                  <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Undo2 className="h-4 w-4" /> Request return
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reason for return</DialogTitle>
                        <DialogDescription>
                          Tell us what went wrong so the vendor can help.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        rows={4}
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="The product didn't fit / was damaged / …"
                      />
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setReturnOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button variant="hero" onClick={submitReturn}>
                          Submit return
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

              {order.returnRequest && (
                <div className="rounded-xl border-2 border-warning/40 bg-warning/10 p-3 text-sm">
                  <p className="font-bold text-warning-foreground">
                    Return requested
                  </p>
                  <p className="text-xs mt-1">
                    Status:{" "}
                    <span className="font-semibold capitalize">
                      {order.returnRequest.status}
                    </span>
                  </p>
                </div>
              )}

              {canReview && (
                <ReviewForm
                  order={order}
                  onSubmit={(productId, rating, comment) =>
                    addReview({ productId, orderId: order.id, rating, comment })
                  }
                />
              )}
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function ReviewForm({
  order,
  onSubmit,
}: {
  order: { id: string; items: { productId: string; name: string }[] };
  onSubmit: (productId: string, rating: number, comment: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(order.items[0].productId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="w-full">
          <Star className="h-4 w-4" /> Leave a review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your experience</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Product</Label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full mt-1.5 rounded-lg border-2 border-border bg-background h-10 px-3"
            >
              {order.items.map((i) => (
                <option key={i.productId} value={i.productId}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}>
                  <Star
                    className={`h-7 w-7 ${n <= rating ? "fill-warning text-warning" : "text-muted"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Comment</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="mt-1.5"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={() => {
              onSubmit(productId, rating, comment);
              setOpen(false);
            }}
          >
            Post review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
