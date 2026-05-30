# 🧩 Form Composition Guideline (Angular)

### 🎯 Objetivo
>Definir una forma consistente de componer formularios en cotizadores, manejando formulario padre que orquesta (steps), y features/shared  components que encapsulan su propio subForm

---

## ✅ Regla principal

El FormGroup vive en el Step (container) y los features reciben sub-form groups.

---

## 🧱 Estructura

Cada subform encapsula:
* estructura (FormGroup)
* validaciones
* UI

El padre (step):

* compone los subforms
* orquesta flujo (submit, navegación)
* es la única fuente de verdad del estado del form---

## 🏭 Form como contrato (RECOMENDADO)

Cada feature define su estructura mediante una factory:

```ts
export function createPersonForm(fb: FormBuilder) {
  return fb.group({
    age: [null, Validators.required],
    address: ['', Validators.required]
  });
}
```

Y el padre luego lo usa

```ts
form = this.fb.group({
  person: createPersonForm(this.fb),
  insured: createInsuredForm(this.fb)
});
```

## 🔗 Validaciones cruzadas (cross-subform)

Cuando una validación involucra múltiples subforms, **NO debe vivir en los features**.

### ✅ Regla

> Las validaciones que cruzan subforms pertenecen al **FormGroup raíz (Step)**.

---

### 🧠 Motivo

- Los subforms deben estar desacoplados
- El Step tiene la visión completa del formulario

---

### 🛠️ Implementación

Definir un validator a nivel root:

```ts
export function crossValidator(group: AbstractControl) {...}
```

y luego el form padre lo aplica

```ts
this.form = this.fb.group(
  {
    person: createPersonForm(this.fb),
    quotation: createQuotationForm(this.fb)
  },
  {
    validators: [crossValidator]
  }
);
```

## ❌Anti patterns (evitar)

* Crear FormGroup dentro de features
* Duplicar estructura del form en múltiples lugares
* Features con lógica de estado (acoplamiento al store)
* No usar factories (rompe consistencia entre steps)
* Manejar estado del form en múltiples servicios