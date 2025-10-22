import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

class FullCalendarHassCard extends HTMLElement {
  setConfig(config) {
    // accept entities or calendarEntities for convenience
    const entities =
      (Array.isArray(config.entities) && config.entities) ||
      (Array.isArray(config.calendarEntities) && config.calendarEntities) ||
      [];

    this._config = {
      // sensible defaults for your use-case
      initialView: 'timeGridWeek',
      headerToolbar: { left: 'prev,next', center: '', right: '' },
      allDaySlot: false,
      firstDay: 1,
      slotMinTime: '07:00:00',
      slotMaxTime: '21:00:00',
      hiddenDays: [],        // e.g. [0,6] to hide Sun/Sat
      nowIndicator: true,
      expandRows: true,
      entities,
      ...config,
    };

    if (!this._root) {
      this._root = this.attachShadow({ mode: 'open' });
      this._container = document.createElement('div');
      this._container.style.minHeight = '420px';
      this._container.style.width = '100%';
      this._container.style.boxSizing = 'border-box';
      this._root.appendChild(this._container);
    }

    this._ensureCalendar();
  }

  set hass(hass) {
    this._hass = hass;
  }

  getCardSize() {
    return 5;
  }

  _ensureCalendar() {
    if (this._calendar) this._calendar.destroy();

    this._calendar = new Calendar(this._container, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: this._config.initialView,
      headerToolbar: this._config.headerToolbar,
      allDaySlot: this._config.allDaySlot,
      firstDay: this._config.firstDay,
      slotMinTime: this._config.slotMinTime,
      slotMaxTime: this._config.slotMaxTime,
      hiddenDays: this._config.hiddenDays || [],
      nowIndicator: this._config.nowIndicator !== false,
      height: 'auto',
      expandRows: this._config.expandRows !== false,
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      datesSet: (arg) => this._loadRange(arg.start, arg.end),
    });

    this._calendar.render();
  }

  async _loadRange(start, end) {
    if (!this._hass || !Array.isArray(this._config.entities) || !this._config.entities.length) {
      this._calendar?.removeAllEvents();
      return;
    }

    const params = `start=${start.toISOString()}&end=${end.toISOString()}`;
    const events = [];

    for (const item of this._config.entities) {
      const entity = typeof item === 'string' ? item : item.entity || item;
      const color =
        typeof item === 'object' && (item.color || item.eventColor || item.backgroundColor);

      try {
        const data = await this._hass.callApi('GET', `calendars/${entity}?${params}`);
        for (const ev of data) {
          events.push({
            id: `${entity}_${ev.uid || ev.summary || ''}_${ev.start}`,
            title: ev.summary || '(no title)',
            start: ev.start,
            end: ev.end,
            allDay: !!ev.all_day,
            backgroundColor: color,
            borderColor: color,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('fullcalendar-hass-card: failed to load', entity, e);
      }
    }

    this._calendar.removeAllEvents();
    this._calendar.addEventSource(events);
  }
}

customElements.define('fullcalendar-hass-card', FullCalendarHassCard);