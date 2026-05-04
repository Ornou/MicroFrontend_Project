/**
 * Event Bus - Communication entre Micro-Frontends
 *
 * Pattern Pub/Sub simple et efficace.
 *
 * Usage:
 *   import eventBus from 'shared/eventBus';
 *
 *   // S'abonner
 *   eventBus.on('event:name', (data) => console.log(data));
 *
 *   // Emettre
 *   eventBus.emit('event:name', { key: 'value' });
 *
 *   // Se desabonner
 *   eventBus.off('event:name', callback);
 */

// Helper pour formater l'heure
const getTimestamp = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * S'abonner a un evenement
   * @param {string} event - Nom de l'evenement
   * @param {Function} callback - Fonction a appeler
   * @param {string} source - Source du callback (pour logging)
   * @returns {Function} Fonction pour se desabonner
   */
  on(event, callback, source = 'unknown') {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    // Wrapper pour logger la réception
    const wrappedCallback = (data) => {
      console.log(`%c[${getTimestamp()}] EVENT BUS ↓ ${event}%c (traité par ${source})`, 'color: #4CAF50; font-weight: bold', 'color: #4CAF50');
      callback(data);
    };
    
    // Stocker les deux pour pouvoir les désabonner
    wrappedCallback.__originalCallback = callback;
    wrappedCallback.__source = source;
    
    this.listeners[event].push(wrappedCallback);

    // Retourne une fonction pour se desabonner facilement
    return () => this.off(event, callback);
  }

  /**
   * Se desabonner d'un evenement
   * @param {string} event - Nom de l'evenement
   * @param {Function} callback - Fonction a retirer
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(
      cb => cb.__originalCallback !== callback && cb !== callback
    );
  }

  /**
   * Emettre un evenement
   * @param {string} event - Nom de l'evenement
   * @param {any} data - Donnees a transmettre
   */
  emit(event, data) {
    // Log l'émission
    console.log(`%c[${getTimestamp()}] EVENT BUS ↑ ${event}%c ${JSON.stringify(data)}`, 'color: #2196F3; font-weight: bold', 'color: #2196F3');
    
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[${getTimestamp()}] [EventBus] Error in listener for ${event}:`, error);
      }
    });
  }

  /**
   * S'abonner une seule fois
   * @param {string} event - Nom de l'evenement
   * @param {Function} callback - Fonction a appeler
   */
  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// Singleton global - partage entre tous les MFEs
if (!window.__EVENT_BUS__) {
  window.__EVENT_BUS__ = new EventBus();
}

export default window.__EVENT_BUS__;
