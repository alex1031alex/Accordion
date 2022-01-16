// Selectors
const ACCORDION_SELECTOR = `.accordion`;
const TRIGGER_SELECTOR = `.accordion__trigger`;
const PANEL_SELECTOR = `.accordion__panel`;
const ALLOW_MULTIPLE_ATTRIBUTE = `data-allow-multiple`;
const ALLOW_TOGGLE_ATTRIBUTE = `data-allow-toggle`;
const CONTROLS_ATTRIBUTE = `aria-controls`;
const EXPANDED_ATTRIBUTE = `aria-expanded`;
const HIDDEN_CLASS = `hidden`;

document.addEventListener(`DOMContentLoaded`, () => {
  const accordions = document.querySelectorAll(ACCORDION_SELECTOR);

  accordions.forEach(($accordion) => {
    const settings = getSettings($accordion);
    const accordion = new Accordion($accordion, settings);
    accordion.init();
  });
});

const getSettings = (accordion) => {
  const settings = {
    isMultiple: false,
    isToggling: false
  }

  settings.isMultiple = accordion.hasAttribute(ALLOW_MULTIPLE_ATTRIBUTE);
  settings.isToggling = settings.isMultiple || accordion.hasAttribute(ALLOW_TOGGLE_ATTRIBUTE);

  return settings;
};

class Accordion {
  constructor($root, settings) {
    this._$root = $root;
    this._triggers = null;
    this._panels = null;
    this._activeTrigger = null;
    this._isMultiple = settings.isMultiple;
    this._isToggling = settings.isToggling;
  }

  init() {
    this._triggers = Array.from(this._$root.querySelectorAll(TRIGGER_SELECTOR));this._panels = Array.from(this._$root.querySelectorAll(PANEL_SELECTOR));
    this._triggerClickHandler = this._triggerClickHandler.bind(this);

    this._triggers.forEach(($trigger, index) => {
      const $panel = this._panels[index];

      if (!$panel) {
        return;
      }

      if (!$trigger.hasAttribute(CONTROLS_ATTRIBUTE)) {
        if (!$panel.hasAttribute(`id`)) {
          throw Error(`No existing id for each accordion panel. Please, set it`)
        }

        const panelId = $panel.id;
        $trigger.setAttribute(CONTROLS_ATTRIBUTE, panelId);
      }

      if (!$trigger.hasAttribute(EXPANDED_ATTRIBUTE)) {
        const attrValue = !$panel.classList.contains(HIDDEN_CLASS);
        $trigger.setAttribute(EXPANDED_ATTRIBUTE, attrValue);

        if (attrValue) {
          this._activeTrigger = $trigger;
        }
      }

      $trigger.addEventListener(`click`, this._triggerClickHandler);
    });
  }

  _triggerClickHandler(evt) {
    const target = evt.target;
    const isTargetActive = target.getAttribute(EXPANDED_ATTRIBUTE) === `true`;

    if (!this._isMultiple && this._activeTrigger && this._activeTrigger !== target) {
      // Если это не множественный аккордеон
      // и есть что-то открытое, то это нужно закрыть
      this._close(this._activeTrigger);
    }

    if (!isTargetActive) {
      // Если клик по контролу закрытой секции, 
      // Нужно её открыть
      this._open(target);
      this._activeTrigger = target;
    }

    if (this._isToggling && isTargetActive) {
      // Если клик по открытой секции
      // и допускается самостоятельное закрытие,
      // то нужно открыть секцию
      this._close(target);
    }
  }

  _close($trigger) {
    const panel = this._getPanel($trigger);

    $trigger.setAttribute(EXPANDED_ATTRIBUTE, `false`);
    panel.classList.add(HIDDEN_CLASS);
  }

  _open($trigger) {
    const panel = this._getPanel($trigger);

    $trigger.setAttribute(EXPANDED_ATTRIBUTE, `true`);
    panel.classList.remove(HIDDEN_CLASS);
  }

  _getPanel($trigger) {
    const panelId = $trigger.getAttribute(CONTROLS_ATTRIBUTE);
    const panel = document.getElementById(panelId);

    return panel;
  }
}
