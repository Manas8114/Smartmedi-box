#ifndef SENSORS_H
#define SENSORS_H

class SensorManager {
public:
  void init();
  float readWeight();
  bool readIR();
  
private:
  // Pin para celda de carga (HX711)
  const int LOADCELL_DOUT_PIN = 4;
  const int LOADCELL_SCK_PIN = 5;
  
  // Pin para sensor IR
  const int IR_SENSOR_PIN = 18;
  
  float calibrateWeight();
  bool weightInitialized = false;
};

#endif

