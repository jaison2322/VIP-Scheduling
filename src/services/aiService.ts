import type {
  ExtractedFields,
  EventType,
  Priority,
  Person,
  FamilyEvent,
  ScheduleItem,
  RelationshipHistoryItem,
  GiftHistoryItem,
  ScheduleConflict,
  AIAnalysis,
  Invitation,
} from '../types';
import { generateId } from '../utils/id';

// ─── OCR Text Parser ─────────────────────────────────────────────────────────
// Extracts structured fields from raw OCR text using regex and keyword matching

export function parseOCRText(ocrText: string): ExtractedFields {
  const text = ocrText.toLowerCase();
  const confidence: Record<string, number> = {};

  // Detect event type
  const eventType = detectEventType(text);
  confidence.eventType = eventType ? 0.85 : 0.3;

  // Extract date
  const dateResult = extractDate(text);
  confidence.date = dateResult ? 0.8 : 0.2;

  // Extract time
  const timeResult = extractTime(text);
  confidence.time = timeResult ? 0.8 : 0.3;

  // Extract venue
  const venueResult = extractVenue(ocrText); // Use original case
  confidence.venue = venueResult ? 0.7 : 0.2;

  // Extract names
  const namesResult = extractNames(ocrText);
  confidence.mainPerson = namesResult.mainPerson ? 0.6 : 0.2;
  confidence.hostName = namesResult.hostName ? 0.5 : 0.2;

  // Generate title
  const title = generateTitle(eventType, namesResult.mainPerson || '');
  confidence.title = title ? 0.7 : 0.3;

  return {
    eventType: eventType || 'other',
    title,
    mainPerson: namesResult.mainPerson,
    hostName: namesResult.hostName,
    date: dateResult || undefined,
    time: timeResult || undefined,
    venue: venueResult || undefined,
    location: extractLocation(ocrText),
    description: generateDescription(ocrText),
    confidence,
  };
}

function detectEventType(text: string): EventType | null {
  const patterns: [RegExp, EventType][] = [
    [/wedding|marriage|vivah|kalyanam|muhurtham|bride|groom|weds|reception/i, 'wedding'],
    [/engagement|betrothal|ring ceremony|nischayam/i, 'engagement'],
    [/birthday|b'day|birth day|bday/i, 'birthday'],
    [/anniversary/i, 'anniversary'],
    [/house\s*warm|griha\s*pravesh|new\s*home/i, 'house_warming'],
    [/baby\s*shower|seemantham|valaikappu/i, 'baby_shower'],
    [/graduation|convocation/i, 'graduation'],
    [/retirement|farewell/i, 'retirement'],
    [/funeral|condolence|memorial/i, 'funeral'],
    [/conference|seminar|launch|inaugur|summit|business/i, 'business_event'],
    [/puja|pooja|havan|temple|religious/i, 'religious'],
    [/cultural|dance|music|concert/i, 'cultural'],
  ];

  for (const [pattern, type] of patterns) {
    if (pattern.test(text)) return type;
  }
  return null;
}

function extractDate(text: string): string | null {
  // Try various date formats
  const patterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/,
    // Month DD, YYYY
    /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})/i,
    // DD Month YYYY
    /(\d{1,2})(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
    // Short month
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})/i,
  ];

  const months: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04',
    may: '05', june: '06', july: '07', august: '08',
    september: '09', october: '10', november: '11', december: '12',
    jan: '01', feb: '02', mar: '03', apr: '04',
    jun: '06', jul: '07', aug: '08', sep: '09',
    oct: '10', nov: '11', dec: '12',
  };

  // Try DD/MM/YYYY
  const numericMatch = text.match(patterns[0]);
  if (numericMatch) {
    const [, day, month, year] = numericMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try Month DD, YYYY
  const monthNameMatch = text.match(/(?:(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4}))/i);
  if (monthNameMatch) {
    const monthNum = months[monthNameMatch[1].toLowerCase()];
    return `${monthNameMatch[3]}-${monthNum}-${monthNameMatch[2].padStart(2, '0')}`;
  }

  // Try DD Month YYYY
  const dayMonthMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
  if (dayMonthMatch) {
    const monthNum = months[dayMonthMatch[2].toLowerCase()];
    return `${dayMonthMatch[3]}-${monthNum}-${dayMonthMatch[1].padStart(2, '0')}`;
  }

  return null;
}

function extractTime(text: string): string | null {
  const timeMatch = text.match(/(\d{1,2})[:\.](\d{2})\s*(am|pm|a\.m|p\.m)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const meridiem = timeMatch[3]?.replace('.', '').toLowerCase();

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  // Try "6 PM" style
  const simpleTimeMatch = text.match(/(\d{1,2})\s*(am|pm|a\.m|p\.m)/i);
  if (simpleTimeMatch) {
    let hours = parseInt(simpleTimeMatch[1]);
    const meridiem = simpleTimeMatch[2].replace('.', '').toLowerCase();
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:00`;
  }

  return null;
}

function extractVenue(text: string): string | null {
  const venuePatterns = [
    /venue\s*[:\-]\s*(.+?)(?:\n|$)/i,
    /at\s+(?:the\s+)?(.+?(?:hall|hotel|palace|mandapam|convention|centre|center|resort|auditorium|ground|mahal|kalyana|banquet|garden))[\s,.]?/i,
    /(?:hall|hotel|palace|mandapam|convention|centre|center|resort|auditorium|mahal|kalyana|banquet)[\s:]+(.+?)(?:\n|,|$)/i,
  ];

  for (const pattern of venuePatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function extractLocation(text: string): string | undefined {
  const locationPatterns = [
    /(?:address|location|place)\s*[:\-]\s*(.+?)(?:\n|$)/i,
    /(?:chennai|bangalore|mumbai|delhi|hyderabad|kolkata|pune|coimbatore|madurai|trichy|salem)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return undefined;
}

function extractNames(text: string): { mainPerson: string | undefined; hostName: string | undefined } {
  // Look for common patterns like "son of X", "daughter of X"
  const hostMatch = text.match(/(?:son|daughter|s\/o|d\/o)\s+(?:of\s+)?(?:sri\.?\s+|mr\.?\s+|mrs\.?\s+|shri\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);

  // Look for "weds" pattern
  const wedsMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:weds|&|and)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);

  let mainPerson: string | undefined;
  let hostName: string | undefined;

  if (wedsMatch) {
    mainPerson = `${wedsMatch[1]} & ${wedsMatch[2]}`;
  }

  if (hostMatch) {
    hostName = hostMatch[1];
  }

  // If no match, try to find capitalized names
  if (!mainPerson) {
    const nameMatches = text.match(/(?:mr\.?\s+|mrs\.?\s+|sri\.?\s+|shri\.?\s+|smt\.?\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
    if (nameMatches && nameMatches.length > 0) {
      mainPerson = nameMatches[0].replace(/(?:mr\.?\s+|mrs\.?\s+|sri\.?\s+|shri\.?\s+|smt\.?\s+)/i, '').trim();
    }
  }

  return { mainPerson, hostName };
}

function generateTitle(eventType: EventType | null, mainPerson: string): string {
  if (!eventType || !mainPerson) return 'New Event';

  const typeLabels: Record<string, string> = {
    wedding: 'Wedding',
    engagement: 'Engagement',
    birthday: 'Birthday',
    anniversary: 'Anniversary',
    house_warming: 'House Warming',
    baby_shower: 'Baby Shower',
    graduation: 'Graduation',
    retirement: 'Retirement',
    funeral: 'Memorial',
    business_event: 'Business Event',
    reception: 'Reception',
    cultural: 'Cultural Event',
    religious: 'Religious Event',
    other: 'Event',
  };

  return `${mainPerson}'s ${typeLabels[eventType] || 'Event'}`;
}

function generateDescription(text: string): string | undefined {
  // Take first 200 chars of the OCR text as a basic description
  const cleaned = text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > 10 ? cleaned.substring(0, 200) : undefined;
}

// ─── Person Matcher ──────────────────────────────────────────────────────────
// Fuzzy-matches extracted names against stored people

export function findMatchingPerson(
  extractedFields: ExtractedFields,
  people: Person[]
): Person | undefined {
  const searchTerms: string[] = [];

  if (extractedFields.mainPerson) searchTerms.push(extractedFields.mainPerson.toLowerCase());
  if (extractedFields.hostName) searchTerms.push(extractedFields.hostName.toLowerCase());

  for (const person of people) {
    const nameWords = person.name.toLowerCase().split(' ');
    const nicknameWords = person.nickname.toLowerCase().split(' ');
    const allWords = [...nameWords, ...nicknameWords];

    for (const term of searchTerms) {
      const termWords = term.split(' ');
      // Check if any term word matches any person word
      for (const tw of termWords) {
        if (tw.length < 3) continue;
        for (const pw of allWords) {
          if (pw.includes(tw) || tw.includes(pw)) {
            return person;
          }
        }
      }
    }
  }

  return undefined;
}

// ─── Relationship History Builder ────────────────────────────────────────────

export function getRelationshipHistory(
  personId: string,
  familyEvents: FamilyEvent[]
): RelationshipHistoryItem[] {
  const history: RelationshipHistoryItem[] = [];

  for (const event of familyEvents) {
    const guest = event.guests.find((g) => g.personId === personId);
    if (guest) {
      history.push({
        eventName: event.name,
        eventDate: event.date,
        eventType: event.eventType,
        role: guest.attendance === 'attended' ? 'Attended' : 'Invited (not attended)',
      });
    }
  }

  return history.sort((a, b) => b.eventDate.localeCompare(a.eventDate));
}

// ─── Gift History Builder ────────────────────────────────────────────────────

export function getGiftHistory(
  personId: string,
  familyEvents: FamilyEvent[]
): GiftHistoryItem[] {
  const gifts: GiftHistoryItem[] = [];

  for (const event of familyEvents) {
    const guest = event.guests.find(
      (g) => g.personId === personId && g.gift
    );
    if (guest && guest.gift) {
      gifts.push({
        eventName: event.name,
        eventDate: event.date,
        gift: guest.gift,
        giftCategory: guest.giftCategory,
        estimatedValue: guest.estimatedValue,
      });
    }
  }

  return gifts.sort((a, b) => b.eventDate.localeCompare(a.eventDate));
}

// ─── Schedule Conflict Detector ──────────────────────────────────────────────

export function detectScheduleConflicts(
  date: string,
  time: string | undefined,
  schedule: ScheduleItem[],
  existingInvitations: Invitation[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  // Check schedule items on the same date
  const sameDaySchedule = schedule.filter((s) => s.date === date);
  for (const item of sameDaySchedule) {
    if (time && item.startTime) {
      // Check time overlap
      const eventHour = parseInt(time.split(':')[0]);
      const scheduleHour = parseInt(item.startTime.split(':')[0]);
      const scheduleEndHour = item.endTime
        ? parseInt(item.endTime.split(':')[0])
        : scheduleHour + 2;

      if (eventHour >= scheduleHour && eventHour < scheduleEndHour) {
        conflicts.push({
          conflictingItemId: item.id,
          conflictingItemTitle: item.title,
          conflictingTime: `${item.startTime}${item.endTime ? ' - ' + item.endTime : ''}`,
          type: 'time_overlap',
        });
      } else {
        conflicts.push({
          conflictingItemId: item.id,
          conflictingItemTitle: item.title,
          conflictingTime: `${item.startTime}${item.endTime ? ' - ' + item.endTime : ''}`,
          type: 'same_day',
        });
      }
    } else {
      conflicts.push({
        conflictingItemId: item.id,
        conflictingItemTitle: item.title,
        conflictingTime: `${item.startTime}${item.endTime ? ' - ' + item.endTime : ''}`,
        type: 'same_day',
      });
    }
  }

  // Check other invitations on the same date
  const sameDayInvitations = existingInvitations.filter(
    (inv) => inv.date === date && inv.status !== 'ignored'
  );
  for (const inv of sameDayInvitations) {
    conflicts.push({
      conflictingItemId: inv.id,
      conflictingItemTitle: inv.nickname || inv.title,
      conflictingTime: inv.time || 'Time not specified',
      type: 'same_day',
    });
  }

  return conflicts;
}

// ─── Priority Calculator ─────────────────────────────────────────────────────

export function calculatePriority(
  person: Person | undefined,
  relationshipHistory: RelationshipHistoryItem[],
  giftHistory: GiftHistoryItem[],
  conflicts: ScheduleConflict[]
): { priority: Priority; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  if (!person) {
    return {
      priority: 'low',
      reason: 'No matching person found in your contacts. Consider adding this person to your network.',
    };
  }

  // Relationship type scoring
  const relationshipScores: Record<string, number> = {
    family: 40,
    relative: 35,
    business_partner: 30,
    client: 25,
    colleague: 20,
    friend: 25,
    neighbor: 15,
    acquaintance: 10,
    other: 5,
  };

  score += relationshipScores[person.relationship] || 5;
  reasons.push(
    `${person.nickname || person.name} is your ${person.relationship.replace('_', ' ')}.`
  );

  // Previous attendance scoring
  const attendedEvents = relationshipHistory.filter((h) => h.role === 'Attended');
  if (attendedEvents.length > 0) {
    score += attendedEvents.length * 15;
    reasons.push(
      `Attended ${attendedEvents.length} of your family event${attendedEvents.length > 1 ? 's' : ''}: ${attendedEvents.map((e) => e.eventName.replace("Jaison's ", '')).join(', ')}.`
    );
  }

  // Gift value scoring
  const totalGiftValue = giftHistory.reduce(
    (sum, g) => sum + (g.estimatedValue || 0),
    0
  );
  if (totalGiftValue > 50000) {
    score += 25;
    reasons.push(
      `Previously gave high-value gifts totaling ₹${totalGiftValue.toLocaleString('en-IN')}.`
    );
  } else if (totalGiftValue > 20000) {
    score += 15;
    reasons.push(
      `Previously gave gifts valued at ₹${totalGiftValue.toLocaleString('en-IN')}.`
    );
  } else if (totalGiftValue > 0) {
    score += 8;
    reasons.push(
      `Previously gave gifts valued at ₹${totalGiftValue.toLocaleString('en-IN')}.`
    );
  }

  // Gift category bonus
  const hasGoldGift = giftHistory.some((g) => g.giftCategory === 'gold');
  if (hasGoldGift) {
    score += 10;
    reasons.push('Has given gold gifts — indicates strong relationship.');
  }

  // Conflict awareness
  const timeConflicts = conflicts.filter((c) => c.type === 'time_overlap');
  if (timeConflicts.length > 0) {
    reasons.push(
      `⚠️ Schedule conflict: ${timeConflicts.map((c) => `${c.conflictingItemTitle} at ${c.conflictingTime}`).join(', ')}.`
    );
  }

  // Determine priority
  let priority: Priority;
  if (score >= 50) {
    priority = 'high';
  } else if (score >= 25) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  return {
    priority,
    reason: reasons.join(' '),
  };
}

// ─── Full AI Analysis Pipeline ───────────────────────────────────────────────

export function runAIAnalysis(
  ocrText: string,
  people: Person[],
  familyEvents: FamilyEvent[],
  schedule: ScheduleItem[],
  existingInvitations: Invitation[]
): AIAnalysis {
  // Step 1: Parse OCR text
  const extractedFields = parseOCRText(ocrText);

  // Step 2: Find matching person
  const relatedPerson = findMatchingPerson(extractedFields, people);

  // Step 3: Get relationship history
  const relationshipHistory = relatedPerson
    ? getRelationshipHistory(relatedPerson.id, familyEvents)
    : [];

  // Step 4: Get gift history
  const giftHistory = relatedPerson
    ? getGiftHistory(relatedPerson.id, familyEvents)
    : [];

  // Step 5: Check schedule conflicts
  const scheduleConflicts = extractedFields.date
    ? detectScheduleConflicts(
        extractedFields.date,
        extractedFields.time,
        schedule,
        existingInvitations
      )
    : [];

  // Step 6: Calculate priority
  const { priority, reason } = calculatePriority(
    relatedPerson,
    relationshipHistory,
    giftHistory,
    scheduleConflicts
  );

  // Step 7: Calculate overall confidence
  const fieldConfidences = Object.values(extractedFields.confidence);
  const avgConfidence =
    fieldConfidences.reduce((sum, c) => sum + c, 0) / fieldConfidences.length;

  return {
    id: generateId('analysis'),
    invitationId: '',
    ocrText,
    extractedFields,
    confidence: Math.round(avgConfidence * 100) / 100,
    relatedPerson,
    relationshipHistory,
    giftHistory,
    scheduleConflicts,
    suggestedPriority: priority,
    priorityReason: reason,
  };
}

// ─── Demo OCR Text (for when Tesseract can't process) ────────────────────────

export const DEMO_OCR_TEXTS = [
  `With the Blessings of God
Sri Ramesh Kumar & Smt. Padma Kumar
cordially invite you to the Wedding Reception of their son
KARTHIK KUMAR
with
DIVYA SHARMA
on Sunday, August 30, 2026
at 6:00 PM
Venue: Chennai Convention Centre
Mount Road, Chennai - 600002
Dinner to follow
RSVP: +91 98765 43210`,

  `You are cordially invited to celebrate
the 60th Birthday of
Dr. Lakshmi Iyer
on September 5, 2026
at 7:00 PM
Hotel Savera
RK Salai, Chennai
Cultural program and Dinner
With love, Iyer Family`,

  `Wedding Invitation
Sri Arun Prakash & Family
request the pleasure of your company
at the marriage of their daughter
SNEHA PRAKASH
with
RAJESH KUMAR
on Monday, September 15, 2026
Muhurtham: 11:15 AM
Venue: Kalyana Mandapam, T. Nagar, Chennai
Lunch to follow`,
];
