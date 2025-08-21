import React, { useState } from "react";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Truck, Shield } from "lucide-react";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutPageProps {
  cartItems: CartItem[];
  onBack: () => void;
}

const CheckoutForm = ({ cartItems, onBack }: CheckoutPageProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    gstNumber: ""
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharges = 500;
  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const total = subtotal + deliveryCharges + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/order-success',
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your order has been placed successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span>₹{deliveryCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={billingInfo.name}
                      onChange={(e) => setBillingInfo({...billingInfo, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={billingInfo.email}
                      onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={billingInfo.phone}
                      onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                    <Input
                      id="gstNumber"
                      value={billingInfo.gstNumber}
                      onChange={(e) => setBillingInfo({...billingInfo, gstNumber: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={billingInfo.address}
                      onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={billingInfo.city}
                      onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={billingInfo.pincode}
                      onChange={(e) => setBillingInfo({...billingInfo, pincode: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <PaymentElement />
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!stripe || isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Complete Order - ₹{total.toLocaleString()}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Free delivery on orders above ₹10,000</p>
                    <p className="text-sm text-gray-600">Expected delivery in 3-5 business days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Checkout({ cartItems, onBack }: CheckoutPageProps) {
  const [clientSecret, setClientSecret] = useState("");

  React.useEffect(() => {
    // Create PaymentIntent
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 500 + 
               (cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.18)
      }),
    })
    .then((res) => res.json())
    .then((data) => setClientSecret(data.clientSecret))
    .catch((error) => console.error('Error creating payment intent:', error));
  }, [cartItems]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm cartItems={cartItems} onBack={onBack} />
    </Elements>
  );
}