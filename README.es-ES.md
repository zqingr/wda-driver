# wda-driver
[Versión en chino](https://github.com/zqingr/wda-driver/tree/master/doc/README_CN.md)

Biblioteca de cliente Node para Facebook WebDriverAgent (no oficial)

La mayoría de las funciones están terminadas.

## Instalación
1. Necesitas iniciar WebDriverAgent tú mismo

 Sigue las instrucciones en <https://github.com/facebook/WebDriverAgent>

 Es mejor iniciar con Xcode para evitar problemas de CodeSign.

 Pero también está bien iniciar WDA con la línea de comandos.

 ```
 xcodebuild -project WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner -destination 'platform=iOS Simulator,name=iPhone 6' test
 ```

2. Instalar el cliente wda-driver

 ```
npm install --save wda-driver
 ```

## Conexión TCP sobre USB (opcional)
Puedes usar una red WiFi, es muy conveniente, pero no muy estable.

Encontré una herramienta llamada `iproxy` que puede reenviar el puerto del dispositivo a localhost, su código fuente está aquí <https://github.com/libimobiledevice/libusbmuxd>

El uso es muy sencillo `iproxy <puerto local> <puerto remoto> [udid]`

## Configuración
```javascript
const wda = require('wda-driver')
```

## Cómo usar
### Crear un cliente

```javascript
const wda = require('wda-driver')

const c = new wda.Client('http://localhost:8100')

// http://localhost:8100 es el valor por defecto
// O puedes usar c = wda.Client() directamente
```

### Cliente

```javascript
// Mostrar estado
console.log(await c.status())

// Presionar el botón de inicio
await c.home()

// Realizar healthcheck
await c.healthcheck()

// Obtener fuente de página

// formato (str): solo se admiten los tipos de formato 'xml' y 'json'
// accessible (bool): cuando se establece en true, el formato siempre es 'json'
const source = await c.source() // formato XML
const source = await c.source(null, true) // por defecto falso, formato JSON
```

Toma una captura de pantalla, solo se puede guardar en formato png

```javascript
await c.screenshot('screen.png')
```

Abrir aplicación

```javascript
const s = await c.session('com.apple.Health')
console.log(await s.orientation())
await s.close()
```

Para un navegador web como Safari puedes definir la página con la que se abrirá:
```javascript
const s = await c.session('com.apple.mobilesafari', ['-u', 'https://www.google.com/ncr'])
console.log(await s.orientation())
await s.close()
```

### Operaciones de sesión
```javascript
// ID actual de paquete y sessionId
console.log(s.getId(), s.getBundleId())

// Uno de <PORTRAIT | LANDSCAPE>
console.log(await s.orientation()) // esperar PORTRAIT

// Cambiar orientación
// LANDSCAPE | PORTRAIT | UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT |UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN
await s.orientation(orientation)

// Desactivar App durante un tiempo
await s.deactivate(5) // 5 segundos

// Obtener ancho y alto
console.log(await s.getWindowSize())
// Salida JSON esperada
// Por ejemplo: {'height': 736, 'width': 414}

// Simular toque
await s.tap(88, 200)

// Doble toque
await s.doubleTap(200, 200)

// Simular deslizamiento, utilizando la API de arrastrar
await s.swipe(x1, y1, x2, y2, 0.5) // 0.5 segundos
await s.swipeLeft()
await s.swipeRight()
await s.swipeUp()
await s.swipeDown()

// Toque y mantén
await s.tapHold(x, y, 1.0)
```

### Encontrar elemento

```javascript
// Por ejemplo, esperar: true o false
// usando id para encontrar el elemento y verificar si existe
const selector = s.selector({id: "URL"})
await selector.exists() // devuelve true o false

// usando id u otras condiciones de consulta
s.selector({id: 'URL'})
s.selector({name: 'URL'})
s.selector({text: "URL"}) // text es un alias de name
s.selector({nameContains: 'UR'})
s.selector({label: 'Address'})
s.selector({labelContains: 'Addr'})
s.selector({name:'URL', index: 1}) # encontrar el segundo elemento. el índice comienza desde 0

// combina condiciones de búsqueda
// los atributos siguientes pueden combinarse
// :"className", "name", "label", "visible", "enabled"

s.selector({className: 'Button', name: 'URL', visible: true, labelContains: "Addr"})
```

Método de búsqueda más potente

```javascript
s.selector({xpath: '//Button[@name="URL"]'})
s.selector({classChain: '**/Button[`name == "URL"`]'})
s.selector({predicate: 'name LIKE "UR*"'})
```

### Operaciones de elemento (eg: `tap`, `scroll`, `set_text` etc...)
Ejemplo de búsqueda de elemento y tocar

```javascript
// Obtener el primer elemento coincidente
// La función get() es muy importante.devolverá un objeto Elemento
// cuando se encuentren elementos en 10 segundos(:valor por defecto:), el objeto Elemento se devuelve

const e = await s.selector({text: 'Dashboard'}).get(10) // e es un objeto de elementos
await e.tap() // tocar el elemento
```

Haz clic en el elemento si existe

```javascript
await s.selector({text: 'Dashboard'}).clickExists() // devuelve inmediatamente si no se encuentra

await s.selector({text: 'Dashboard'}).clickExists(5) // espera 5 segundos
```

Otras operaciones de Elemento

```javascript
// Verificar si los elementos existen
console.log(await s.selector({text: 'Dashboard'}).exists())

// Encontrar todos los elementos coincidentes, devolver Array de objetos Elemento
await s.selector({className: 'Other'}).findElements()

// Usar índice para encontrar el segundo elemento
await s.selector({className: 'Other', index: 2}).exists()

// Usar child para buscar elementos sub
await s.selector({text: 'Dashboard'}).child({className: 'Cell'}).exists()

// Tiempo máximo por defecto es 10 segundos
// Pero puedes cambiarlo por
s.setTimeout(50)

// realizar operaciones de elementos
await e.tap()
await e.click() // alias de tap
// El teclado debe ser solicitado por defecto
await e.clearText()
await e.setText("Hello world")
await e.tapHold(2) // tapAndHold durante 2.0 segundos

await e.scroll() // hacer desplazamiento para que el elemento sea visible

// direcciones pueden ser "up", "down", "left", "right"
// desplazamiento predeterminado a su altura o anchura según la dirección
await e.scroll('up', 100)

// Establecer texto
await e.setText("Hello WDA") // uso normal
await e.setText("Hello WDA\n") // enviar texto con enter
await e.setText("\b\b\b") // eliminar 3 caracteres

// Esperar que el elemento desaparezca
await s({className: 'Other'}).waitGone(10)

// Deslizar TODO
// s(className="Image").swipe("left")

// Pinchar
s(className="Map").pinch(2, 1) // scale=2, speed=1
s(className="Map").pinch(0.1, -1) // scale=0.1, speed=-1 (no entiendo muy bien tampoco)

// propiedades (bool)
await e.getAccessible()
await e.getDisplayed()
await e.getEnabled()
await e.getVisible()
await e.getAccessibilityContainer()

// propiedades (str)
await e.getId() 
await e.getLabel()
await e.getClassName()
await e.getText()
await e.getName()
await e.getDisplayed()
await e.getEnabled()
await e.getValue()
await e.getValue()

// Bounds devuelve namedtuple
const rect = await e.getBounds() // Rect { x: 0, y: 73, width: 375, height: 666 }
rect.y // 73
```

Alerta

```javascript
console.log(await s.alert().exists())
console.log(await s.alert().text())
console.log(await s.alert().text())

await s.alert().accept() // Realmente hace clic en el primer botón de alerta
await s.alert().dismiss() // Realmente hace clic en el segundo botón de alerta
await s.alert().wait(5) // si la alerta aparece en 5 segundos devuelve true, de lo contrario false (por defecto 20.0)
await s.alert().wait() // espera que la alerta aparezca en 20 segundos

await s.alert().buttons()
// ejemplo devuelve: ["配置", "好"]

await s.alert().click('好')
```

## Apps integradas en iOS
**Apps de Apple**

| Nombre        | ID de paquete                                |
|  ----------- | ---------------------------------------- |
| iMovie      | com.apple.iMovie                         |
| App Store   | com.apple.AppStore                       |
| Tiempo      | com.apple.weather                        |
| Cámara      | com.apple.camera                         |
| iBooks      | com.apple.iBooks                         |
| Salud       | com.apple.Health                         |
| Ajustes     | com.apple.Preferences                    |
| Watch       | com.apple.Bridge                         |
| Mapas       | com.apple.Maps                           |
| Game Center | com.apple.gamecenter                     |
| Billetera   | com.apple.Passbook                       |
| Teléfono    | com.apple.mobilephone                    |
| Notas       | com.apple.mobilenotes                    |
| Brújula     | com.apple.compass                        |
| Navegador   | com.apple.mobilesafari                   |
| Calendario  | com.apple.mobilecal                      |
| Mensajes    | com.apple.MobileSMS                      |
| Reloj       | com.apple.mobiletimer                    |
| Fotos       | com.apple.mobileslideshow                |
| Recordatorios | com.apple.reminders                      |
| Escritorio  | com.apple.springboard (Iniciar esto causará que tu iPhone se reinicie) |

**Apps de terceros**

| Nombre   | ID de paquete             |
|  ------ | --------------------- |
| QQ      | com.tencent.mqq       |
| WeChat  | com.tencent.xin       |
| Clash of Clans | com.supercell.magic |
| DingTalk | com.laiwang.DingTalk |
| Skype  | com.skype.tomskype    |
| Chrome | com.google.chrome.ios |


Otra manera de listar aplicaciones instaladas en tu teléfono es usar `ideviceinstaller`
instalar con `brew install ideviceinstaller`

Listar apps con comando

```sh
$ ideviceinstaller -l
```

## Referencias
Este proyecto es una transplantación de https://github.com/openatx/facebook-wda

Código fuente

- [Router](https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBElementCommands.m#L62)
- [Alerta](https://github.com/facebook/WebDriverAgent/blob/master/WebDriverAgentLib/Commands/FBAlertViewCommands.m#L25)

## DISEÑO
[DISEÑO](DESIGN.md)

## LICENCIA
[MIT](LICENSE)
