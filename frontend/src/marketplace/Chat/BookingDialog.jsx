import React, { useState } from "react";
import { X, Calendar, Users, Home, CreditCard } from "lucide-react";

const BookingDialog = ({ hotel, isOpen, onClose, onConfirm }) => {
    const [bookingData, setBookingData] = useState({
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        adults: 1,
        rooms: 1
    });

    if (!isOpen || !hotel) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        const start = new Date(bookingData.checkIn);
        const end = new Date(bookingData.checkOut);
        const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        const usdTotal = hotel.priceUsd * bookingData.rooms * nights;
        const ethTotal = (usdTotal * 0.000001).toFixed(6);
        return { usdTotal, ethTotal, nights };
    };

    const { usdTotal, ethTotal, nights } = calculateTotal();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in font-sans">
            <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Complete Booking</h2>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">{hotel.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-foreground/50">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                                <Calendar size={12} className="text-primary" /> Check In
                            </label>
                            <input
                                type="date"
                                name="checkIn"
                                value={bookingData.checkIn}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                                <Calendar size={12} className="text-primary" /> Check Out
                            </label>
                            <input
                                type="date"
                                name="checkOut"
                                value={bookingData.checkOut}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                                <Users size={12} className="text-primary" /> Adults
                            </label>
                            <input
                                type="number"
                                name="adults"
                                min="1"
                                value={bookingData.adults}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                                <Home size={12} className="text-primary" /> Rooms
                            </label>
                            <input
                                type="number"
                                name="rooms"
                                min="1"
                                value={bookingData.rooms}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-foreground/40">
                            <span>Total for {nights} night{nights > 1 ? 's' : ''}</span>
                            <span>{bookingData.rooms} Room{bookingData.rooms > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-2xl font-black text-foreground">${usdTotal.toLocaleString()}</div>
                                <div className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1">
                                    <CreditCard size={12} /> {ethTotal} ETH Sepolia
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest italic">
                                Fixed Rate Applied
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
                        onClick={() => onConfirm({ ...bookingData, totalEth: ethTotal, nights, totalUsd: usdTotal })}
                        className="flex-[2] px-6 py-4 rounded-2xl bg-primary text-background text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        Confirm & Pay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingDialog;
