# fullcalendar-hass-card
A minimal, modern FullCalendar (v6.1.19) card for Home Assistant with a clean week grid, arrows, and visible-hour window. Supports HA calendar entities out of the box.


# FullCalendar Hass Card

A minimal, modern FullCalendar (v6.1.19) card for Home Assistant with:
- Clean **timeGridWeek** view (hours grid)
- Prev/next navigation
- Visible-hour window (hide sleep hours)
- Works with HA `calendar.*` entities

## Install (HACS custom repo)

1. Build & release (see below), then in HA:
2. **HACS → Frontend → ⋮ → Custom repositories → Add**
   - URL: your repo URL
   - Category: **Plugin**
3. Install the card, then ensure a resource exists:
   - `/hacsfiles/fullcalendar-hass-card/fullcalendar-hass-card.js` (type: module)

## Example config

```yaml
type: custom:fullcalendar-hass-card
initialView: timeGridWeek
firstDay: 1
allDaySlot: false
slotMinTime: "07:00:00"
slotMaxTime: "21:00:00"
hiddenDays: [0,6]      # optional: hide Sun/Sat
nowIndicator: true
headerToolbar:
  left: prev,next
  center: ''
  right: ''
entities:
  - entity: calendar.family
    color: '#6a7f73'
  - entity: calendar.work
    color: '#9aa6a0'