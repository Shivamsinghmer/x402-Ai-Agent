import React from "react";
import ReactMarkdown from "react-markdown";
import { SparklesIcon } from "lucide-react";

/**
 * Renders a single chat message (User, Assistant, or System)
 */
const ChatMessage = ({ msg, activeAgent }) => {
    if (msg.role === "user") {
        return (
            <div className="flex justify-end pr-0 animate-fade-in">
                <div className="max-w-[85%] bg-primary text-background px-5 py-3 rounded-2xl rounded-tr-none text-sm font-bold shadow-sm">
                    {msg.content}
                </div>
            </div>
        );
    }

    if (msg.role === "system") {
        return (
            <div className="flex justify-center my-6 animate-fade-in">
                <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-border bg-muted/30">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
            </div>
        );
    }

    // Assistant / AI Member
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 pl-1">
                <div className="w-6 h-6 rounded-md bg-muted border border-border flex items-center justify-center text-xs overflow-hidden">
                    {activeAgent.botIcon ? (
                        <img src={activeAgent.botIcon} alt="Agent" className="w-4 h-4" />
                    ) : (
                        activeAgent.icon
                    )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{activeAgent.name}</span>
            </div>

            <div className="max-w-full p-6 bg-card border border-border rounded-2xl rounded-tl-none space-y-6 shadow-sm">
                {/* Hotel Data Metadata UI */}
                {msg.data && msg.data.hotels && msg.data.hotels.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">Available Hotels</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {msg.data.hotels.map((hotel, i) => (
                                <div key={i} className="p-4 rounded-xl bg-background border border-border group transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{hotel.name}</h4>
                                        <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                            {hotel.rating} ⭐
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-foreground/50 mb-3 truncate">
                                        {hotel.cityName}, {hotel.countryCode}
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div>
                                            <div className="text-xs font-bold text-foreground">${hotel.priceUsd}</div>
                                            <div className="text-[9px] font-bold text-primary/60">{hotel.priceEth} ETH</div>
                                        </div>
                                        <button
                                            onClick={() => window.dispatchEvent(new CustomEvent('initiate-hotel-booking', { detail: hotel }))}
                                            className="px-3 py-1.5 rounded-lg bg-primary text-background text-[10px] font-bold hover:opacity-90 transition-all active:scale-95"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Flight Data Metadata UI */}
                {msg.data && msg.data.flights && msg.data.flights.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">Available Flights</div>
                        <div className="space-y-3">
                            {msg.data.flights.map((flight, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-background border border-border group transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-[10px] font-bold uppercase text-foreground/40 shrink-0">
                                                    {flight.airlineCode}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">{flight.airlineName}</h4>
                                                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-0.5">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`} • {flight.duration.replace("PT", "").toLowerCase()}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6 pl-11">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-bold text-foreground">{new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    <div className="text-[9px] font-bold text-foreground/40 uppercase tracking-tighter">{msg.data.origin}</div>
                                                </div>
                                                <div className="flex-1 h-px bg-border relative">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[8px] font-bold text-foreground/20 italic tracking-widest uppercase">Direct</div>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <div className="text-xs font-bold text-foreground">{new Date(flight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    <div className="text-[9px] font-bold text-foreground/40 uppercase tracking-tighter">{msg.data.destination}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sm:pl-6 sm:border-l border-border flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                                            <div className="text-right">
                                                <div className="text-lg font-black text-foreground">${flight.priceUsd}</div>
                                                <div className="text-[10px] font-bold text-primary/60">{flight.priceEth} ETH</div>
                                            </div>
                                            <button
                                                onClick={() => window.dispatchEvent(new CustomEvent('initiate-flight-booking', { detail: { ...flight, origin: msg.data.origin, destination: msg.data.destination, date: msg.data.date } }))}
                                                className="px-5 py-2.5 rounded-xl bg-primary text-background text-[11px] font-bold hover:opacity-90 transition-all active:scale-95 shadow-md shadow-primary/10 whitespace-nowrap"
                                            >
                                                Book Flight
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Data Metadata UI (ChainMind) */}
                {msg.data && msg.data.ethPrice && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-background border border-border transition-all hover:border-primary/20">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-1">ETH/USD</div>
                            <div className="text-sm font-bold text-foreground">${msg.data.ethPrice?.usd || "0.00"}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border transition-all hover:border-primary/20">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-1">SOL/USD</div>
                            <div className="text-sm font-bold text-foreground">${msg.data.solPrice?.usd || "0.00"}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border col-span-2 sm:col-span-1 transition-all hover:border-primary/20">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-1">Gas</div>
                            <div className="text-sm font-bold text-foreground">{msg.data.gasPrices?.safe || "--"} Gwei</div>
                        </div>
                    </div>
                )}

                {/* Markdown Content */}
                <div className="text-sm font-medium leading-relaxed prose prose-slate dark:prose-invert max-w-none prose-sm text-foreground prose-p:mb-4 last:prose-p:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Footer Info */}
                <div className="pt-4 border-t border-border flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-foreground/20">
                    <span>{new Date(msg.data?.timestamp || Date.now()).toLocaleTimeString()}</span>
                    <div className="flex items-center gap-1.5">
                        <SparklesIcon size={10} />
                        <span>x402 protocol secured</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
