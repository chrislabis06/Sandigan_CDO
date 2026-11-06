import { Initiative } from '../types/initiative';

/**
 * Generate Google Calendar Web URL
 */
export function getGoogleCalendarUrl(initiative: Initiative): string {
  const title = encodeURIComponent(`[Sandigan] ${initiative.title}`);
  const details = encodeURIComponent(
    `${initiative.description}\n\nVenue / Rendezvous: ${initiative.meetPoint || initiative.location}\nOrganizer: ${initiative.organizerName}\nWhat to bring:\n${initiative.whatToBring.map(item => '• ' + item).join('\n')}\n\nCoordinated via Sandigan Grassroots Platform`
  );
  const location = encodeURIComponent(`${initiative.location}`);

  // Approximate next weekend date format for calendar
  const now = new Date();
  const eventDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const startStr = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, '').substring(0, 15) + 'Z';
  const endStr = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '').substring(0, 15) + 'Z';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startStr}/${endStr}`;
}

/**
 * Download standard iCalendar (.ics) file for Apple Calendar, Outlook, etc.
 */
export function downloadIcsFile(initiative: Initiative) {
  const now = new Date();
  const eventDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const startStr = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, '').substring(0, 15) + 'Z';
  const endStr = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '').substring(0, 15) + 'Z';

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sandigan Grassroots Platform//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:sandigan-${initiative.id}@sandigan.ph`,
    `DTSTAMP:${startStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:[Sandigan] ${initiative.title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${initiative.description.replace(/\n/g, '\\n')}\\n\\nOrganizer: ${initiative.organizerName}`,
    `LOCATION:${initiative.location.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${initiative.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
