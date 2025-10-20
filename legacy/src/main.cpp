/*
 * Hello! This code is written to control the Enschede Lights Up signaling system.
 * There are a number of things you need to configure. These are listed below this comment.
 *
 *
 * LED Layout
 *  ___________________________________
 *  [9] [10] [11] [12] [13] [14] [15]
 *  ▔▔\      \▔▔▔▔▔ /      /▔▔
 *       \ [08] \        / [16] /
 *  ______\      \______/      /_______
 *  [18] [19] [20] [21] [22] [23] [24]
 *   ▔▔▔/      /▔▔▔\      \▔▔▔▔
 *       / [17] /        \ [07] \
 *  ____/      /__________\      \_____
 *  [00] [01] [02] [03] [04] [05] [06]
 *  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 *
 *  Changelog v0.9
 *  Added graphic to clarify LED numbering
 *  Added boot sequence to confirm correct installation of LEDs
 *
 *  Enschede Lights Up Signaling V0.9 by Daniël Vegter is marked with CC0 1.0
 */

#include <Arduino.h>
#include <FastLED.h>

#define DATA_PIN 4 // GPIO pin connected to the LED data line
#define ARROWRIGHT // Choose between CROSS, ARROWLEFT, ARROWRIGHT
#define ARROWV2
#define LEDBRIGHTNESS 40 // LED brightness from 0 to 100

unsigned long previousArrowAnim = 0;
unsigned long interval = 0;
int arrowState; // 0 = no arrow, 1 = animation in, 2 = arrow visible, 3 = animation out

#define NUM_LEDS 25 // Number of LEDs in your strip

// #define SIMULATOR

#define arrowInAnimationTime 300  // Arrow in-animation time in milliseconds
#define arrowOutAnimationTime 300 // Arrow out-animation time in milliseconds
#define crossInAnimationTime 500  // Cross in-animation time in milliseconds
#define crossOutAnimationTime 500 // Cross out-animation time in milliseconds
#define offTime 1000              // Time in milliseconds the signal stays off
#define onTime 2000               // Time in milliseconds the signal stays on

int crossLeds[] = {9, 15, 8, 16, 21, 17, 7, 0, 6};
#ifdef ARROWV2
int rightArrowLeds[] = {9, 8, 21, 17, 0, 20, 19, 18};
int leftArrowLeds[] = {15, 6, 7, 16, 21, 22, 23, 24};
#endif
#ifndef ARROWV2
int leftArrowLeds[] = {19, 8, 17, 20, 21, 22, 23, 24, 11, 2};
int rightArrowLeds[] = {18, 19, 20, 21, 22, 23, 16, 7, 13, 4};
#endif

CRGB leds[NUM_LEDS];
CRGB fadeColor;
CRGB warmWhite = 0xffBF7F; // Warm white color
CRGB red = 0xFF0000;      // Red color

void drawArrow();
void arrowTimer();
void bootSequence();
void fillRed();

void setup()
{
#ifndef SIMULATOR
  FastLED.addLeds<UCS2903, DATA_PIN, RGB>(leds, NUM_LEDS);
#endif
#ifdef SIMULATOR
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS); // GRB ordering is assumed
#endif

  FastLED.setBrightness(LEDBRIGHTNESS * 255 / 100);

  bootSequence();
}

void loop()
{
  arrowTimer();
}

void bootSequence()
{
  // Test all LEDs individually with red, then turn them warm white
  for (int i = 0; i < NUM_LEDS + 1; i++)
  {
    leds[i] = 0xff0000; // Red
    delay(100);
    FastLED.show();
    leds[i] = warmWhite;
  }

  fillRed();
  delay(250);

  // Test cross pattern
  for (unsigned long i = 0; i < sizeof(crossLeds) / sizeof(int); i++)
  {
    leds[crossLeds[i]] = warmWhite;
  }

  FastLED.show();
  delay(500);
  fillRed();
  delay(250);

  // Test left arrow pattern
  for (unsigned long i = 0; i < sizeof(leftArrowLeds) / sizeof(int); i++)
  {
    leds[leftArrowLeds[i]] = warmWhite;
  }

  FastLED.show();
  delay(500);
  fillRed();
  delay(250);

  // Test right arrow pattern
  for (unsigned long i = 0; i < sizeof(rightArrowLeds) / sizeof(int); i++)
  {
    leds[rightArrowLeds[i]] = warmWhite;
  }

  FastLED.show();
  delay(500);
  fillRed();
  delay(250);
}

void fillRed()
{
  for (int i = 0; i < NUM_LEDS; i++)
  {
    leds[i] = red;
  }
  FastLED.show();
}

void arrowTimer()
{
  if (millis() - previousArrowAnim > offTime)
  { // Arrow or cross has been off for the specified time
    drawArrow();
    previousArrowAnim = millis();
  }
}

void drawArrow()
{
#ifdef CROSS
  // Display cross pattern
  for (unsigned long i = 0; i < sizeof(crossLeds) / sizeof(int); i++)
  {
    leds[crossLeds[i]] = warmWhite;
  }
  delay(onTime);
  previousArrowAnim = millis();

  fillRed();
  previousArrowAnim = millis();
#endif
#ifndef ARROWV2
#ifdef ARROWLEFT
  // Left arrow animation (version 1) - sequential LED activation
  leds[24] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 7);
  leds[23] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 7);
  leds[22] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 7);
  leds[21] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 7);
  leds[20] = warmWhite;
  leds[11] = warmWhite;
  leds[2] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 7);
  leds[8] = warmWhite;
  leds[17] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 7);
  leds[19] = warmWhite;
  FastLED.show();

  delay(onTime);
  previousArrowAnim = millis();
  
  // Fade out animation
  while ((millis() - previousArrowAnim) < arrowOutAnimationTime)
  {
    int fade = (millis() - previousArrowAnim) * 255 / arrowOutAnimationTime;
    fadeColor = blend(warmWhite, red, fade);

    for (unsigned long i = 0; i < sizeof(leftArrowLeds) / sizeof(int); i++)
    {
      leds[leftArrowLeds[i]] = fadeColor;
    }
    FastLED.show();
  }

  previousArrowAnim = millis();

#endif
#ifdef ARROWRIGHT
  // Right arrow animation (version 1) - sequential LED activation
  leds[9] = warmWhite;
  leds[0] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[8] = warmWhite;
  leds[17] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[21] = warmWhite;
  FastLED.show();

  delay(onTime);
  previousArrowAnim = millis();
  while ((millis() - previousArrowAnim) < arrowOutAnimationTime)
  {
    int fade = (millis() - previousArrowAnim) * 255 / arrowOutAnimationTime;
    fadeColor = blend(warmWhite, red, fade);

    for (unsigned long i = 0; i < sizeof(rightArrowLeds) / sizeof(int); i++)
    {
      leds[rightArrowLeds[i]] = fadeColor;
    }
    FastLED.show();
  }

  previousArrowAnim = millis();

#endif
#endif
#ifdef ARROWV2

#ifdef ARROWLEFT
  // Left arrow animation (version 2) - improved pattern
  delay(arrowInAnimationTime / 3);
  leds[24] = warmWhite;
  leds[15] = warmWhite;
  leds[6] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[23] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[16] = warmWhite;
  leds[7] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[22] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[21] = warmWhite;
  FastLED.show();

  delay(onTime);
  previousArrowAnim = millis();
  while ((millis() - previousArrowAnim) < arrowOutAnimationTime)
  {
    int fade = (millis() - previousArrowAnim) * 255 / arrowOutAnimationTime;
    fadeColor = blend(warmWhite, red, fade);

    for (unsigned long i = 0; i < sizeof(leftArrowLeds) / sizeof(int); i++)
    {
      leds[leftArrowLeds[i]] = fadeColor;
    }
    FastLED.show();
  }

  previousArrowAnim = millis();

#endif
#ifdef ARROWRIGHT
  // Right arrow animation (version 2) - improved pattern
  delay(arrowInAnimationTime / 3);
  leds[9] = warmWhite;
  leds[18] = warmWhite;
  leds[0] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[19] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[8] = warmWhite;
  leds[17] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[20] = warmWhite;
  FastLED.show();

  delay(arrowInAnimationTime / 3);
  leds[21] = warmWhite;
  FastLED.show();

  delay(onTime);
  previousArrowAnim = millis();
  while ((millis() - previousArrowAnim) < arrowOutAnimationTime)
  {
    int fade = (millis() - previousArrowAnim) * 255 / arrowOutAnimationTime;
    fadeColor = blend(warmWhite, red, fade);

    for (unsigned long i = 0; i < sizeof(rightArrowLeds) / sizeof(int); i++)
    {
      leds[rightArrowLeds[i]] = fadeColor;
    }
    FastLED.show();
  }

  previousArrowAnim = millis();

#endif
#endif
}