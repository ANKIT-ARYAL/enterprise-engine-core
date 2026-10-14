import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  return [key, value ?? true];
}));

const domain = String(args.domain || 'generic').toLowerCase();
const count = Math.max(1, Math.min(100, Number(args.count || 10)));
const output = path.resolve(String(args.output || `staging/${domain}-mock-data.json`));

const templates = {
  hotel: (index) => ({
    guestName: `Guest ${index + 1}`,
    roomNumber: `${101 + index}`,
    roomType: ['Standard', 'Deluxe', 'Suite'][index % 3],
    reservationStatus: ['confirmed', 'checked_in', 'checked_out'][index % 3],
    checkIn: '2026-11-01T14:00:00.000Z',
    checkOut: '2026-11-04T11:00:00.000Z',
  }),
  school: (index) => ({
    studentName: `Student ${index + 1}`,
    grade: 9 + (index % 4),
    className: ['Mathematics', 'Science', 'English'][index % 3],
    attendanceStatus: index % 5 === 0 ? 'absent' : 'present',
    guardianEmail: `guardian${index + 1}@staging.example`,
  }),
  generic: (index) => ({
    name: `Staging Record ${index + 1}`,
    status: index % 2 === 0 ? 'active' : 'draft',
    notes: 'Generated staging-only data. Replace or remove before production use.',
  }),
};

const createRecord = templates[domain] || templates.generic;
const records = Array.from({ length: count }, (_, index) => createRecord(index));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify({ domain, generatedFor: 'staging', records }, null, 2)}\n`);
console.log(`Generated ${records.length} ${domain} staging records in ${output}`);
