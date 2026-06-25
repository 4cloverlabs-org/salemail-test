import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Globe, User, Mail, ChevronRight, Check } from 'lucide-react';
import { fetchEventTypes, fetchAvailability, fetchBookedSlotsForDate, saveBooking } from '../lib/db';
import type { EventType, Availability } from '../lib/db';
import { getLocalTimezone, formatSelectedDate } from '../lib/timezone';
import { sendBookingEmails } from '../lib/email';
import Calendar from '../components/Calendar';
import SlotPicker from '../components/SlotPicker';

export default function BookingFlow() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventType | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  // Form Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [visitorTz] = useState(() => getLocalTimezone());
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Event and Availability
  useEffect(() => {
    async function loadConfig() {
      try {
        const events = await fetchEventTypes();
        const foundEvent = events.find(e => e.id === eventTypeId);
        if (!foundEvent) {
          navigate('/');
          return;
        }
        setEvent(foundEvent);

        const avail = await fetchAvailability();
        setAvailability(avail);
      } catch (e) {
        console.error('Error loading config:', e);
        setError('Failed to load scheduling configuration.');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [eventTypeId, navigate]);

  // 2. Fetch Booked Slots when Date is Selected
  useEffect(() => {
    let active = true;
    async function loadSlots() {
      if (!selectedDate) return;
      try {
        const slots = await fetchBookedSlotsForDate(selectedDate);
        if (active) {
          setBookedSlots(slots);
          // If the previously selected slot is booked, reset it
          if (slots.includes(selectedTime)) {
            setSelectedTime('');
          }
        }
      } catch (e) {
        console.error('Error loading booked slots:', e);
      }
    }
    loadSlots();
    return () => {
      active = false;
    };
  }, [selectedDate, selectedTime]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleNextStep = () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both a date and an available time slot.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please fill out your name and email address.');
      return;
    }
    if (!event || !availability) return;

    setSubmitting(true);
    setError('');

    try {
      // 1. Send emails (generates meeting URL Jitsi/Google Meet)
      const emailRes = await sendBookingEmails({
        name,
        email,
        message,
        eventTitle: event.title,
        eventDuration: event.duration,
        scheduledDate: formatSelectedDate(selectedDate),
        scheduledTime: selectedTime,
        timezone: visitorTz,
      });

      // 2. Save booking details in DB (localStorage or Firestore)
      const bookingData = await saveBooking({
        eventTypeId: event.id,
        eventTitle: event.title,
        eventDuration: event.duration,
        name,
        email,
        message,
        date: selectedDate,
        time: selectedTime,
        timezone: visitorTz,
        meetLink: emailRes.generatedMeetLink,
      });

      // Navigate to success screen
      navigate('/success', {
        state: {
          booking: bookingData,
          isDemo: emailRes.isDemo
        }
      });
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An error occurred during booking. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid hsl(var(--border-color))', borderTopColor: 'hsl(var(--accent-primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!event || !availability) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <p>Booking configuration missing or event type not found.</p>
        <Link to="/" style={{ marginTop: '20px' }} className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0', flex: 1, display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
      <div className="container" style={{ maxWidth: '1000px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        
        {/* Back Link */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text-secondary))', marginBottom: '30px', fontSize: '0.9rem', width: 'fit-content' }}>
          <ArrowLeft size={16} />
          <span>Back to Event Selection</span>
        </Link>

        {/* Outer Split Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 2fr)',
          gap: '30px',
          backgroundColor: 'hsl(var(--bg-secondary))',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid hsl(var(--border-color))',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          flex: 1
        }}>
          
          {/* Left Column: Event details */}
          <div style={{
            padding: '40px',
            borderRight: '1px solid hsl(var(--border-color))',
            backgroundColor: 'hsl(var(--bg-primary))',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div>
              <span className="badge badge-blue" style={{ marginBottom: '12px' }}>Host Availability</span>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>{event.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
                <Clock size={16} />
                <span>{event.duration} Mins Session</span>
              </div>
            </div>
            
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: '1.6', fontWeight: 300 }}>
              {event.description}
            </p>

            {/* Timezone indicators */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid hsl(var(--border-color))', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                <Globe size={14} />
                <span>Host: {availability.timezone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                <Globe size={14} />
                <span>Visitor: {visitorTz}</span>
              </div>
            </div>

            {selectedDate && selectedTime && (
              <div style={{
                backgroundColor: 'rgba(hsl(var(--accent-primary)), 0.05)',
                border: '1px solid rgba(hsl(var(--accent-primary)), 0.15)',
                padding: '16px',
                borderRadius: 'var(--border-radius-md)',
                marginTop: '16px'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--accent-primary))', fontWeight: 600, textTransform: 'uppercase' }}>Selected Slot</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 550, marginTop: '4px' }}>
                  {formatSelectedDate(selectedDate)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>
                  {selectedTime}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Steps (Interactive Date/Time or Details Form) */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            {/* Step Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: step === 1 ? 'hsl(var(--accent-primary))' : 'hsl(var(--accent-success))',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 600
                }}>
                  {step > 1 ? <Check size={12} /> : '1'}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: step === 1 ? 600 : 500 }}>Select Time</span>
              </div>
              <ChevronRight size={14} style={{ color: 'hsl(var(--text-muted))' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: step === 2 ? 'hsl(var(--accent-primary))' : 'hsl(var(--bg-tertiary))',
                  color: step === 2 ? 'white' : 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 600
                }}>
                  2
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: step === 2 ? 600 : 400, color: step === 2 ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))' }}>Your Details</span>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(hsl(var(--accent-danger)), 0.1)', color: 'hsl(var(--accent-danger))', padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {/* STEP 1: Date & Time Picker */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1, justifyContent: 'center' }}>
                <div style={{
                  display: 'flex',
                  gap: '24px',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: '1.2', minWidth: '290px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-secondary))' }}>1. Pick Date</h3>
                    <Calendar
                      selectedDate={selectedDate}
                      onChange={handleDateChange}
                      blockedDates={availability.blockedDates}
                      workingDays={availability.workingDays}
                    />
                  </div>
                  <div style={{ flex: '1', minWidth: '280px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-secondary))' }}>2. Pick Time Slot</h3>
                    <SlotPicker
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onChange={(time) => setSelectedTime(time)}
                      bookedSlots={bookedSlots}
                      hostTimezone={availability.timezone}
                      visitorTimezone={visitorTz}
                      workingDays={availability.workingDays}
                      duration={event.duration}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid hsl(var(--border-color))', paddingTop: '20px', marginTop: 'auto' }}>
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedDate || !selectedTime}
                    className="btn btn-primary"
                    style={{ padding: '12px 36px' }}
                  >
                    <span>Continue to Details</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Client Form Details */}
            {step === 2 && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>Provide meeting details</h3>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Fill out the details below to complete your booking reservation.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="client-name" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-secondary))' }}>Your Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'hsl(var(--text-muted))' }} />
                    <input
                      id="client-name"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid hsl(var(--border-color))',
                        backgroundColor: 'hsl(var(--bg-primary))',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="client-email" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-secondary))' }}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'hsl(var(--text-muted))' }} />
                    <input
                      id="client-email"
                      type="email"
                      required
                      placeholder="e.g. john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid hsl(var(--border-color))',
                        backgroundColor: 'hsl(var(--bg-primary))',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="client-notes" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-secondary))' }}>Topics / Questions (Optional)</label>
                  <textarea
                    id="client-notes"
                    rows={4}
                    placeholder="Tell us a little bit about your project or what you'd like to address."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid hsl(var(--border-color))',
                      backgroundColor: 'hsl(var(--bg-primary))',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid hsl(var(--border-color))', paddingTop: '20px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary"
                    disabled={submitting}
                    style={{ padding: '12px 24px' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ padding: '12px 36px' }}
                  >
                    {submitting ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <span>Confirming...</span>
                      </div>
                    ) : (
                      <span>Schedule Meeting</span>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
