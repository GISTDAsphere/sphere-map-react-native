# Getting Started (เริ่มต้นการใช้งาน)

## การใช้งาน Sphere Map ร่วมกับ React Native

### ความต้องการของระบบ

ในการเริ่มต้นพัฒนาแผนที่ในระบบ Sphere ท่านจำเป็นจะต้องใช้ หรือจำเป็นต้องมีการติดตั้งก่อน โดยมีรายการดังนี้:

- **NodeJS Version** >= 20
- **React Native Version** >= 0.63

ในการพัฒนาระบบด้วย React Native Sphere Map รองรับเฉพาะ Android และ iOS เท่านั้น

---

## เริ่มต้นการใช้งาน

### 1. สร้างโครงสร้าง React Native

ท่านจำเป็นต้องมีโครงสร้าง React Native ก่อน โดยสามารถสร้างโครงสร้างได้ด้วยคำสั่ง:

```bash
npx create-expo-app@latest
```

ท่านสามารถดูวิธีการเริ่มต้นของ React Native ได้จาก [Official Get Started with React Native](https://reactnative.dev/docs/getting-started)

### 2. ติดตั้ง Package NPM

ท่านจำเป็นต้องติดตั้ง Package Sphere Map จาก npm โดยสามารถใช้คำสั่งได้ดังนี้:

```bash
npm install sphere-map-react-native
```

### 3. นำเข้า Component Sphere Map

นำเข้า Component Sphere Map ในส่วนที่ต้องการแสดงผลแผนที่:

```javascript
import Sphere from "sphere-map-react-native";
```

### 4. ตั้งค่า Map API Key

ตั้งค่า Map API Key เพื่อใช้งาน โดย Key จะได้จากการสมัครใช้งานจากเว็บไซต์ [https://sphere.gistda.or.th/](https://sphere.gistda.or.th/)

ตัวอย่างการนำแผนที่แสดงบนหน้าแรกของแอปพลิเคชัน:

```javascript
import Sphere from "sphere-map-react-native";

export default function App() {
  Sphere.apiKey = "YOUR_MAP_API_KEY";
  // Rest of your code
}
```

### 5. การแสดงผลแผนที่

การแสดงผลแผนที่ คือการเรียกใช้ Map Component โดยสามารถใส่ option ที่ต้องการเพื่อเริ่มต้นใช้งานได้ดังนี้:

```javascript
return (
  <Sphere.MapView
    ref={(r: any) => {
      // Handle map reference here if needed
    }}
    zoom={15} // Initial zoom level
    onReady={() => {
      // Callback when the map is ready
    }}
    onClick={(location: any) => {
      // Handle click events and access location data
      console.log({ location });
    }}
    onLocation={async () => {
      // Fetch and handle map location updates
    }}
    onDrag={async () => {
      // Handle map drag events
    }}
  />
);
```

---

## การทดสอบระบบ

### Android
- เปิด **Android Emulator**
- หรือทดสอบผ่านอุปกรณ์ Android ได้โดยตรง

### iOS
- เปิด **iOS Emulator**
- การทดสอบระบบ iOS จำเป็นต้องใช้ MacOS ในการจำลองระบบ
