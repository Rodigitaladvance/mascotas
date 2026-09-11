# Revisión de requisitos frente a fuentes oficiales

**Fecha de la revisión:** 11 de septiembre de 2026
**Alcance:** requisitos de entrada para perros, gatos, équidos, aves, conejos y
reptiles en los cinco países de la app (ES, UK, US, CA, AU), más los protocolos
de vacunación que calculan el nivel de protección.
**Estado:** las 22 correcciones están aplicadas en el código.

Este documento es el registro de qué se comprobó, contra qué fuente y qué se
corrigió. Sirve como respaldo de las listas: cualquiera puede seguir los enlaces
del final y verificarlo por su cuenta.

---

## Resumen

De las cinco listas de perro/gato revisadas, **ninguna estaba completa** y **dos
contenían afirmaciones incorrectas**. La estructura del motor es correcta; el
problema estaba en el contenido de las listas.

Tres errores eran de los que estropean un viaje: la app decía "todo listo" a
alguien que habría sido rechazado en el aeropuerto.

**Todo lo que aparece a continuación ya está corregido en la aplicación.** Se
conserva el detalle porque el valor de este documento no es la lista de fallos,
sino poder demostrar contra qué fuente se comprobó cada dato y cuándo.

---

## Errores graves

### 1. Estados Unidos — falta la edad mínima de 6 meses

Desde el 1 de agosto de 2024, **ningún perro menor de 6 meses puede entrar en
EE. UU.**, venga de donde venga. No hay excepción ni trámite alternativo.

La app no lo menciona. Un usuario con un cachorro de cuatro meses vería su
pasaporte al 100 % y sería rechazado en el mostrador.

> Fuente: CDC, *Bringing a Dog into the U.S.*

### 2. Estados Unidos — el documento que pide la app no existe

La lista actual pide "CDC Health Certificate", "Rabies Certificate (USDA)" e
"Screwworm Inspection". Para un perro que viene de España, Reino Unido, Canadá o
Australia (todos países de riesgo bajo o libres de rabia canina), **el único
documento exigido por los CDC es el recibo del CDC Dog Import Form**, un
formulario en línea gratuito.

Ni certificado de rabia, ni certificado sanitario de los CDC, ni inspección de
gusano barrenador. Las tres filas sobran, y falta la única que importa.

> Fuente: CDC, *Entry Requirements for Dogs from Dog-Rabies-Free or Low-Risk Countries*

### 3. Australia — falta la residencia previa de 180 días

Para entrar desde España o Reino Unido, el animal debe haber residido de forma
continuada en un país aprobado **durante los 180 días anteriores a la
exportación**. Es el requisito que más planes rompe, porque no se puede
improvisar: si no se cumple, no hay trámite que lo arregle, solo esperar.

No aparece en la app.

> Fuente: DAFF, guías paso a paso para países del Grupo 3

---

## Errores de contenido

### 4. Reino Unido — el tratamiento antiparasitario se aplica solo a perros

La app lo muestra igual para perros y gatos. **Solo se exige a perros.** Y el
plazo exacto es entre 24 y 120 horas antes de la llegada, no un genérico
"1–5 días".

> Fuente: GOV.UK, *Bring your pet dog, cat or ferret to Great Britain*

### 5. Canadá — "Actualización Política Garrapatas 2025" no existe

No he encontrado esa política en ninguna fuente de la CFIA. **Hay que eliminarla.**
Es el peor tipo de error que puede tener la app: un requisito inventado que
preocupa al usuario sin motivo.

### 6. Canadá — el permiso de importación es para perros comerciales

La app pide "CFIA Import Certificate" a todo el mundo. Para una mascota personal
**no hace falta permiso de importación**: basta el certificado de vacunación
antirrábica y la inspección en frontera. El permiso aplica a importaciones
comerciales de perros menores de 8 meses.

Además, conviene añadir un dato que tranquiliza: **Canadá no impone cuarentena a
las mascotas personales**, vengan de donde vengan.

> Fuente: CFIA, *Bringing animals to Canada: Importing and travelling with pets*

### 7. Australia — el organismo se llama DAFF, no DAWE

La app dice "Import Permit (DAWE)". Ese departamento cambió de nombre: ahora es
**DAFF** (Department of Agriculture, Fisheries and Forestry).

### 8. Australia — la cuarentena de 10 días no es automática

La app afirma "Cuarentena (10 días)". El mínimo real es **30 días**, y solo baja
a 10 si se hace una *identity check* previa, un paso opcional que debe realizar
un veterinario oficial **antes** del análisis de anticuerpos.

Decir "10 días" sin la condición puede hacer que alguien planifique tres semanas
de menos.

---

## Omisiones importantes

### 9. Falta el plazo de 21 días tras la vacuna antirrábica

Aplica a España/UE y a Reino Unido. Tras la primera vacunación **hay que esperar
21 días completos** antes de viajar. Es probablemente el dato práctico más útil
de todos y no aparece en ninguna parte de la app.

### 10. Falta el orden microchip → vacuna

La vacuna antirrábica **solo es válida si se puso después del microchip**. Si se
hizo al revés, hay que revacunar y volver a contar los 21 días. Es un error
frecuente y caro.

Aplica en la UE, Reino Unido y EE. UU.

### 11. Falta la edad mínima de 12 semanas para la primera vacuna

Un cachorro no puede vacunarse de rabia antes de las 12 semanas, lo que en la
práctica sitúa el primer viaje posible en torno a las 15 semanas.

### 12. Australia — faltan las pruebas y tratamientos obligatorios

Para perros desde España o Reino Unido:

- **RNATT** (anticuerpos antirrábicos), válido **365 días** desde la extracción
- **Brucella canis**, muestra tomada en los 45 días previos a la exportación
- **Leishmania infantum**, dentro de los 45 días previos — especialmente
  relevante saliendo de España, donde es endémica
- **Parásitos internos**: dos tratamientos en los 45 días previos, separados al
  menos 14 días, el segundo dentro de los 5 días anteriores a la salida
- **Parásitos externos**: desde 30 días antes, con producto que mate por
  contacto. Los orales tipo NexGard o Bravecto **no se aceptan**, porque exigen
  que la garrapata pique primero

Dato útil: la prueba de **Ehrlichia canis dejó de exigirse el 1 de noviembre de
2022**, porque la enfermedad ya está establecida en Australia.

### 13. España/UE — el antiparasitario no es general

Solo se exige para entrar en **Finlandia, Irlanda, Malta, Noruega e Irlanda del
Norte**, y solo a perros. En el resto de la UE no aplica.

---

## Lo que estaba bien

- El microchip ISO 11784/11785 como base de identificación, en todos los países
- El pasaporte europeo como documento para movimientos dentro de la UE, y que
  cubre solo perros, gatos y hurones
- El AHC (Animal Health Certificate) como documento de entrada a Reino Unido
- Que Australia exige permiso de importación y cuarentena posterior
- Que Australia exige análisis de anticuerpos y no solo la vacuna
- Toda la arquitectura de regímenes por especie: que équidos, aves, conejos y
  reptiles van por normativas distintas es correcto y es lo que diferencia a
  esta app

---

## Segunda pasada: équidos, aves y reptiles

### 14. Équidos — la piroplasmosis no depende del origen

La app solo la exigía si el animal salía de zona endémica. **EE. UU. la exige a
todos los caballos**, con cELISA negativo en los **15 días previos** a la salida.
El origen cambia el énfasis, no la obligación. Corregido.

### 15. Équidos — el Coggins tiene plazo concreto

Seis meses antes de la exportación, por AGID o ELISA. La app decía "validez
limitada en el tiempo", que no ayuda a nadie a planificar. Corregido.

### 16. Équidos — la cuarentena de EE. UU. no es una sola

Son **3, 7 o 60 días** según el estatus sanitario del país donde el animal
residió los 60 días previos, con un mínimo de 7 días de observación. La
diferencia entre 3 y 60 días es la diferencia entre un viaje y una mudanza.

### 17. Équidos — la metritis contagiosa afecta a más animales de los que decíamos

La app hablaba de "reproductores". La norma estadounidense alcanza a **sementales
y yeguas** que hayan residido o transitado por un país afectado en los **últimos
12 meses**, lo que en la práctica es casi cualquier caballo adulto. Además hay
que **reservar plaza en una instalación de cuarentena CEM aprobada**. Corregido.

### 18. Aves — la cuarentena de EE. UU. puede hacerse en casa

La app decía "en instalación autorizada del destino". En realidad **el permiso
puede autorizar cuarentena domiciliaria**, y esa es la vía habitual para una
mascota. Decirlo mal asusta sin motivo. Corregido.

### 19. Aves — faltaban los plazos del permiso

Se solicita por **APHIS eFile con al menos 7 días hábiles** de antelación, tarda
**7–10 días hábiles** en llegar y **caduca a los 30 días**. Ese último dato es el
que arruina viajes: gente que pide el permiso demasiado pronto.

También faltaba el límite: la vía de mascota personal admite **hasta 5 aves**.

### 20. Reptiles — el trámite tiene nombre y formulario

No es una "declaración de vida silvestre" genérica: es el **formulario USFWS
3-177**, que se presenta en línea por **eDecs**, con entrada por **puerto
designado** y **aviso de llegada 48 horas antes** por tratarse de animal vivo.
Corregido.

---

## Una corrección a mi propia revisión

En la primera pasada puse en duda que Australia prohibiera la entrada de conejos.
**Me equivoqué al dudarlo: la app estaba en lo cierto.** DAFF solo admite conejos
procedentes de Nueva Zelanda; del resto de países están prohibidos, y la vía
existente no está pensada para mascotas.

El texto de la app se queda como estaba.

---

## Protocolos de vacunación

Contrastados con las **guías de vacunación de la WSAVA (2024)**, que son la
referencia internacional para perros y gatos.

### 21. Las vacunas centrales no son anuales

La polivalente del perro y la trivalente del gato estaban puestas a 365 días.
La WSAVA recomienda **expresamente abandonar la revacunación anual**: tras la
pauta inicial y el refuerzo del año, los estudios serológicos respaldan el
**refuerzo trienal**.

Marcar como vencida a los doce meses empujaba a vacunar de más, que es justo lo
que las guías tratan de evitar. Corregido a 1.095 días.

### 22. La leucemia felina no es obligatoria para todos los gatos

Estaba tratada como vacuna esencial. La WSAVA la considera **no esencial en
gatos adultos sin acceso al exterior**: solo la recomienda en cachorros y en
gatos que salen o conviven con otros que salen.

Un gato de interior correctamente no vacunado perdía un 20 % de puntuación por
algo que no necesita. Ahora las vacunas opcionales solo se vigilan si consta
alguna dosis; si no hay ninguna, quedan fuera del cálculo en vez de restar.

### Lo que se mantiene

- La antirrábica sigue a un año, que es el criterio conservador y el que aplica
  en la mayor parte de España. El intervalo real depende del producto y de la
  comunidad autónoma
- Tétanos equino anual y gripe equina cada 6 meses
- Mixomatosis y enfermedad hemorrágica del conejo, anuales
- Desparasitación interna trimestral y externa mensual

Y sobre todo se mantiene lo más importante del diseño: **si el veterinario anotó
la fecha de la próxima dosis, manda esa**. Los intervalos de la tabla son solo
el recurso de última hora, porque un calendario genérico no puede saber qué
producto se usó.

| Ámbito | Organismo | Fuente |
|---|---|---|
| Vacunación de perros y gatos | WSAVA | https://wsava.org/global-guidelines/vaccination-guidelines/ |

---

## Sigue pendiente

- Aves y conejos hacia Canadá y Reino Unido, contrastados solo parcialmente
- Los plazos de cuarentena de aves en Reino Unido y Canadá

---

## Fuentes oficiales localizadas

Estas son las URLs que deberían acompañar a cada bloque de requisitos en la app.

| Ámbito | Organismo | Fuente |
|---|---|---|
| Perros a EE. UU. | CDC | https://www.cdc.gov/importation/dogs/index.html |
| Perros a EE. UU. desde país de riesgo bajo | CDC | https://www.cdc.gov/importation/dogs/rabies-free-low-risk-countries.html |
| Formulario obligatorio EE. UU. | CDC | https://www.cdc.gov/importation/dogs/dog-import-form-instructions.html |
| Mascotas a Gran Bretaña | GOV.UK | https://www.gov.uk/bring-pet-to-great-britain |
| Mascotas dentro de la UE | Comisión Europea | https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/movements-within-eu_en |
| Entrada en la UE desde tercer país | Comisión Europea | https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/bringing-pet-eu-non-eu-country_en |
| Mascotas a Canadá | CFIA | https://inspection.canada.ca/en/importing-food-plants-animals/pets |
| Perros a Australia, Grupo 3 | DAFF | https://www.agriculture.gov.au/biosecurity-trade/cats-dogs/how-to-import/step-by-step-guides/category-3-step-by-step-guide-for-dogs |
| Gatos a Australia, Grupo 3 | DAFF | https://www.agriculture.gov.au/biosecurity-trade/cats-dogs/how-to-import/step-by-step-guides/category-3-step-by-step-guide-for-cats |
| Anticuerpos antirrábicos (RNATT) | DAFF | https://www.agriculture.gov.au/biosecurity-trade/cats-dogs/rabies-neutralising-antibody |
| Tratamiento antiparasitario Australia | DAFF | https://www.agriculture.gov.au/biosecurity-trade/cats-dogs/step-by-step-guides/parasite-treatment |
| Condiciones de importación, cualquier especie | DAFF BICON | https://bicon.agriculture.gov.au/ |
| Équidos a EE. UU. | USDA APHIS | https://www.aphis.usda.gov/live-animal-import/equine |
| Aves de compañía a EE. UU. | USDA APHIS | https://www.aphis.usda.gov/pet-travel/another-country-to-us-import/birds |
| Cuarentena de aves en EE. UU. | USDA APHIS | https://www.aphis.usda.gov/pet-travel/another-country-to-us-import/birds/federal-quarantine |
| Fauna silvestre y reptiles a EE. UU. | USFWS | https://www.fws.gov/program/office-of-law-enforcement/information-importers-exporters |
| Mascotas exóticas a Australia | DAFF | https://www.agriculture.gov.au/biosecurity-trade/travelling/bringing-mailing-goods/unique-exotic-pets |
| Especies listadas en CITES | CITES | https://cites.org/eng/app/appendices.php |

España pertenece al **Grupo 3** de Australia, igual que Reino Unido.
Ninguno de los cinco países figura en la lista de alto riesgo de rabia canina de
los CDC.
