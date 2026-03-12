import React, { useState } from "react";
import { X, Plane, Users, CreditCard, MapPin } from "lucide-react";

/**
 * Dialog for confirming flight bookings
 */
const FlightBookingDialog = ({ flight, isOpen, onClose, onConfirm }) => {
    const [bookingData, setBookingData] = useState({
        passengers: 1,
        cabinClass: "ECONOMY"
    });

    if (!isOpen || !flight) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        const usdTotal = flight.priceUsd * bookingData.passengers;
        const ethTotal = (usdTotal * 0.000001).toFixed(6);
        return { usdTotal, ethTotal };
    };

    const { usdTotal, ethTotal } = calculateTotal();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in font-sans">
            <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Confirm Flight</h2>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">{flight.airlineName} • {flight.airlineCode}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/50">
                        <X size={20} />
                    </button>
                </div>

                {/* Flight Details Summary */}
                <div className="px-8 pt-6 pb-2">
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-sm font-black text-foreground">{flight.origin}</div>
                            <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest leading-none">Departure</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-4">
                            <Plane size={14} className="text-primary/40 rotate-90" />
                            <div className="w-full h-px bg-border my-2 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-muted/50 px-2 text-[8px] font-bold text-foreground/20 italic uppercase">Flight</div>
                            </div>
                            <div className="text-[9px] font-bold text-foreground/30 uppercase tracking-tighter">{flight.duration.replace("PT", "").toLowerCase()}</div>
                        </div>
                        <div className="space-y-1 text-right">
                            <div className="text-sm font-black text-foreground">{flight.destination}</div>
                            <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest leading-none">Arrival</div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                                <Users size={12} className="text-primary" /> Passengers
                            </label>
                            <input
                                type="number"
                                name="passengers"
                                min="1"
                                value={bookingData.passengers}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                                <CreditCard size={12} className="text-primary" /> Class
                            </label>
                            <select
                                name="cabinClass"
                                value={bookingData.cabinClass}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                            >
                                <option value="ECONOMY">Economy</option>
                                <option value="PREMIUM_ECONOMY">Premium</option>
                                <option value="BUSINESS">Business</option>
                                <option value="FIRST">First</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-foreground/40">
                            <span>Total for {bookingData.passengers} Passenger{bookingData.passengers > 1 ? 's' : ''}</span>
                            <span>{bookingData.cabinClass.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-2xl font-black text-foreground">${usdTotal.toLocaleString()}</div>
                                <div className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1">
                                    <CreditCard size={12} /> {ethTotal} ETH Sepolia
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest italic">
                                Fee Paid via x402
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-muted/30 border-t border-border flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 rounded-2xl bg-background border border-border text-sm font-bold text-foreground/60 hover:text-foreground hover:bg-muted transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm({ ...bookingData, totalEth: ethTotal, totalUsd: usdTotal, flight })}
                        className="flex-[2] px-6 py-4 rounded-2xl bg-primary text-background text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        Confirm & Pay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlightBookingDialog;
