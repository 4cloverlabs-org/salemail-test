import { Clock, Globe } from 'lucide-react';
import { generateTimeSlots, isSlotInPast, convertHostSlotToVisitor } from '../lib/timezone';

interface SlotPickerProps {
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // e.g. "09:00 AM - 09:30 AM" (always in host timezone format)
  onChange: (time: string) => void;
  bookedSlots: string[];
  hostTimezone: string;
  visitorTimezone: string;
  workingDays: {
    [key: string]: {
      active: boolean;
      slots: { start: string; end: string }[];
    }
  };
  duration: number; // minutes, e.g. 15, 30, 60
}

export default function SlotPicker({
  selectedDate,
  selectedTime,
  onChange,
  bookedSlots,
  hostTimezone,
  visitorTimezone,
  workingDays,
  duration
}: SlotPickerProps) {
  
  if (!selectedDate) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: 'hsl(var(--text-secondary))',
        border: '1px dashed hsl(var(--border-color))',
        borderRadius: 'var(--border-radius-md)',
        padding: '20px',
        textAlign: 'center'
      }}>
        <Clock size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
        <p style={{ fontSize: '0.9rem' }}>Please select a date on the calendar to view available time slots.</p>
      </div>
    );
  }

  // 1. Get host's weekday configuration
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const parts = selectedDate.split('-');
  const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const dayName = weekdays[dateObj.getDay()];
  const hostDayConfig = workingDays[dayName];

  // 2. Generate standard slots based on duration (15, 30, 60 min intervals)
  const allPossibleSlots = generateTimeSlots(duration);

  // Helper to parse time slot e.g. "09:00 AM" to minutes from midnight
  const timeToMinutes = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hr = parseInt(match[1], 10);
    const min = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hr !== 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;
    return hr * 60 + min;
  };

  // 3. Filter slots within host availability window
  const availableSlots = allPossibleSlots.filter(slot => {
    if (!hostDayConfig || !hostDayConfig.active || !hostDayConfig.slots) return false;
    
    const [startRaw, endRaw] = slot.split(' - ');
    const slotStartMin = timeToMinutes(startRaw);
    const slotEndMin = timeToMinutes(endRaw);

    return hostDayConfig.slots.some(hSlot => {
      const [hStartHr, hStartMin] = hSlot.start.split(':').map(Number);
      const [hEndHr, hEndMin] = hSlot.end.split(':').map(Number);
      const hStartTotal = hStartHr * 60 + hStartMin;
      const hEndTotal = hEndHr * 60 + hEndMin;
      return slotStartMin >= hStartTotal && slotEndMin <= hEndTotal;
    });
  });

  const getSlotDetails = (slot: string) => {
    const isOccupied = bookedSlots.includes(slot);
    const isPast = isSlotInPast(selectedDate, slot, hostTimezone);
    const disabled = isOccupied || isPast;
    
    let label = '';
    if (isOccupied) label = 'Occupied';
    else if (isPast) label = 'Passed';

    // timezone conversion if host & visitor timezone differ
    const showVisitorTime = hostTimezone !== visitorTimezone;
    let visitorTimeStr = '';
    if (showVisitorTime) {
      const [startRaw, endRaw] = slot.split(' - ');
      const visStart = convertHostSlotToVisitor(selectedDate, startRaw, hostTimezone, visitorTimezone);
      const visEnd = convertHostSlotToVisitor(selectedDate, endRaw, hostTimezone, visitorTimezone);
      visitorTimeStr = `${visStart} - ${visEnd}`;
    }

    return { disabled, label, visitorTimeStr };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '10px' }}>
        <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} />
          <span>Available Slots</span>
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Globe size={12} />
          <span>Slots in host timezone ({hostTimezone.split('/').pop()?.replace('_', ' ')})</span>
        </span>
      </div>

      {availableSlots.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'hsl(var(--text-secondary))',
          backgroundColor: 'hsl(var(--bg-tertiary))',
          borderRadius: 'var(--border-radius-md)',
          fontSize: '0.9rem'
        }}>
          No working hours scheduled by host on {dayName.charAt(0).toUpperCase() + dayName.slice(1)}s. Please select another date.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '8px',
          maxHeight: '320px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {availableSlots.map((slot) => {
            const { disabled, label, visitorTimeStr } = getSlotDetails(slot);
            const isSelected = selectedTime === slot;
            const shortTime = slot.split(' - ')[0]; // E.g. "09:00 AM"

            return (
              <button
                type="button"
                key={slot}
                disabled={disabled}
                onClick={() => onChange(slot)}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: isSelected 
                    ? '1px solid hsl(var(--accent-primary))' 
                    : '1px solid hsl(var(--border-color))',
                  background: isSelected 
                    ? 'rgba(hsl(var(--accent-primary)), 0.08)' 
                    : disabled 
                      ? 'hsl(var(--bg-tertiary))' 
                      : 'hsl(var(--bg-secondary))',
                  color: isSelected 
                    ? 'hsl(var(--accent-primary))' 
                    : disabled 
                      ? 'hsl(var(--text-muted))' 
                      : 'hsl(var(--text-primary))',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  transition: 'all var(--transition-fast)',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!disabled && !isSelected) {
                    e.currentTarget.style.borderColor = 'hsl(var(--text-primary))';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !isSelected) {
                    e.currentTarget.style.borderColor = 'hsl(var(--border-color))';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{shortTime}</span>
                
                {visitorTimeStr && !disabled && (
                  <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-secondary))', marginTop: '2px', textAlign: 'center', opacity: 0.8 }}>
                    Local: {visitorTimeStr.split(' - ')[0]}
                  </span>
                )}
                
                {label && (
                  <span style={{
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    color: label === 'Occupied' ? 'hsl(var(--accent-danger))' : 'hsl(var(--text-muted))',
                    marginTop: '2px'
                  }}>
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {hostTimezone !== visitorTimezone && (
        <div style={{
          fontSize: '0.75rem',
          backgroundColor: 'hsl(var(--bg-tertiary))',
          padding: '10px 12px',
          borderRadius: 'var(--border-radius-sm)',
          color: 'hsl(var(--text-secondary))',
          lineHeight: '1.4'
        }}>
          <strong>Timezone Note:</strong> You are viewing host times ({hostTimezone.split('/').pop()?.replace('_', ' ')}). 
          Your local timezone is <strong style={{ color: 'hsl(var(--text-primary))' }}>{visitorTimezone.replace('_', ' ')}</strong>. 
          Local conversion is displayed under the host slot where applicable.
        </div>
      )}
    </div>
  );
}
