import { Calendar } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'

class FullCalendarHassCard extends HTMLElement {
  static getConfigElement() { return null; } // no editor (yet)
  static getStubConfig() {
    return {
      initialView: 'timeGridWeek',
      headerToolbar: { left: 'prev,next', center: '', right: '' },
      entities: []
    };
  }

  set hass(hass) {
    this._hass = hass;
    // if calendar exists, you could refresh events when hass updates
  }

  getCardSize() { return 5; }

  _ensureCalendar() {
    if (this._calendar) {
      // update options
      this._calendar.setOption('initialView', this._config.initialView);
      this._calendar.setOption('headerToolbar', this._config.headerToolbar);
      this._calendar.setOption('firstDay', this._config.firstDay);
      this._calendar.setOption('allDaySlot', this._config.allDaySlot);
      this._calendar.setOption('nowIndicator', this._config.nowIndicator);
      this._calendar.setOption('slotMinTime', this._config.slotMinTime);
      this._calendar.setOption('slotMaxTime', this._config.slotMaxTime);
      this._calendar.setOption('hiddenDays', this._config.hiddenDays || []);
      this._calendar.setOption('locale', this._config.locale || 'en');
      this._calendar.render();
      return;
    }

    this._calendar = new Calendar(this._container, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: this._config.initialView,
      headerToolbar: this._config.headerToolbar,
      firstDay: this._config.firstDay,
      allDaySlot: this._config.allDaySlot,
      nowIndicator: this._config.nowIndicator,
      slotMinTime: this._config.slotMinTime,
      slotMaxTime: this._config.slotMaxTime,
      hiddenDays: this._config.hiddenDays || [],
      locale: this._config.locale || 'en',
      height: 'auto',
      expandRows: true,
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      datesSet: (arg) => this._loadRange(arg.start, arg.end),
    });

    this._calendar.render();
  }

  async _loadRange(start, end) {
    if (!this._hass || !this._config?.entities?.length) return;

    // Fetch events for each entity from HA calendar API
    const params = `start=${start.toISOString()}&end=${end.toISOString()}`;
    const events = [];

    for (const item of this._config.entities) {
      const entity = typeof item === 'string' ? item : item.entity || item;
      const color = typeof item === 'object' && (item.color || item.eventColor);

      try {
        const data = await this._hass.callApi('GET', `calendars/${entity}?${params}`);
        for (const ev of data) {
          // HA calendar returns start/end as ISO strings
          events.push({
            id: `${entity}_${ev.uid || ev.summary}_${ev.start}`,
            title: ev.summary || '(no title)',
            start: ev.start,
            end: ev.end,
            allDay: !!ev.all_day,
            backgroundColor: color,
            borderColor: color
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