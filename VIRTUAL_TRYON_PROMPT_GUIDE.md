# Virtual Try-On AI Prompt Construction Guide

## How Gender Influences the AI Prompt

The Virtual Try-On feature uses Google's Vertex AI Imagen model to generate realistic images. The prompt is carefully constructed to produce accurate results.

## Prompt Structure

### 1. Base Description (Opening)
```
"A professional full-body fashion photograph of an adult [GENDER] model standing upright."
```
- **Without Gender**: "...of an adult model..."
- **With Male**: "...of an adult male model..."
- **With Female**: "...of an adult female model..."

### 2. Environment & Style
```
"Studio lighting, neutral gray background, fashion photography style."
```
This ensures professional-quality images with clean backgrounds.

### 3. Physical Appearance

#### Skin Tone
```
"[SKIN_COLOR] complexion."
```
Example: "Fair complexion." or "Medium complexion."

#### Body Proportions
```
"Body proportions: [BUILD], approximately [HEIGHT]cm tall."
```
- **Build** is calculated from BMI:
  - BMI < 18.5: "slim build"
  - BMI 18.5-25: "average build"
  - BMI 25-30: "athletic build"
  - BMI > 30: "curvy build"

Example: "Body proportions: average build, approximately 175cm tall."

#### Gender-Specific Physique (NEW!)
```
"[GENDER_PHYSIQUE] physique."
```
- **Male**: "Masculine physique."
- **Female**: "Feminine physique."
- **Not specified**: (omitted)

This helps the AI understand body shape characteristics.

### 4. Measurements Context
```
"Proportions suited for [WAIST]cm waist clothing."
```
Helps AI understand clothing fit requirements.

### 5. Additional Description
```
"[USER_DESCRIPTION]"
```
Any custom notes the user added (e.g., "Athletic build with broad shoulders")

### 6. Clothing Details
```
"Wearing: [OUTFIT_DESCRIPTION]"
```

**Full Outfit:**
```
"a stylish [COLOR] [NAME]."
```
Example: "a stylish blue summer dress."

**Separate Top & Bottom:**
```
"a [TOP_COLOR] [TOP_NAME], paired with [BOTTOM_COLOR] [BOTTOM_NAME]."
```
Example: "a white t-shirt, paired with blue jeans."

**With Accessories:**
```
"Accessories: [ACCESSORIES]."
```
Example: "Accessories: sunglasses, watch, leather belt."

### 7. Quality Directives
```
"High-quality fashion photography, professional lighting, sharp details."
```
Ensures the AI focuses on photorealistic quality.

---

## Complete Prompt Examples

### Example 1: Male with Full Details
```
A professional full-body fashion photograph of an adult male model standing upright. 
Studio lighting, neutral gray background, fashion photography style. 
Fair complexion. 
Body proportions: average build, approximately 178cm tall. 
Masculine physique. 
Proportions suited for 85cm waist clothing. 
Athletic build with broad shoulders. 
Wearing: a blue formal blazer, paired with gray dress pants. 
Accessories: leather watch, black oxford shoes. 
High-quality fashion photography, professional lighting, sharp details.
```

**This generates:** A male model with fair skin, average build, 178cm tall, wearing a blue blazer and gray pants, with masculine features.

---

### Example 2: Female with Full Details
```
A professional full-body fashion photograph of an adult female model standing upright. 
Studio lighting, neutral gray background, fashion photography style. 
Medium complexion. 
Body proportions: slim build, approximately 165cm tall. 
Feminine physique. 
Proportions suited for 68cm waist clothing. 
Wearing: a stylish red floral summer dress. 
Accessories: small handbag, sandals. 
High-quality fashion photography, professional lighting, sharp details.
```

**This generates:** A female model with medium skin, slim build, 165cm tall, wearing a red floral dress, with feminine features.

---

### Example 3: Gender Not Specified (Minimal Info)
```
A professional full-body fashion photograph of an adult model standing upright. 
Studio lighting, neutral gray background, fashion photography style. 
Body proportions: approximately 170cm tall. 
Wearing: a black t-shirt, paired with blue jeans. 
High-quality fashion photography, professional lighting, sharp details.
```

**This generates:** A generic adult model (AI will choose features) wearing casual clothes.

---

## Why Gender Matters for AI

### 1. Body Shape & Structure
- **Male**: Broader shoulders, narrower hips, more angular features
- **Female**: Narrower shoulders, wider hips, softer features

### 2. Clothing Fit
- **Male clothing**: Designed for masculine proportions (boxier cuts)
- **Female clothing**: Designed for feminine proportions (contoured cuts)

### 3. Pose & Stance
- AI models different standing postures based on gender
- Helps create more natural-looking results

### 4. Facial Features
- Gender helps AI generate appropriate facial characteristics
- More realistic overall appearance

### 5. AI Safety Compliance
- Gender specification helps AI follow safety guidelines
- Ensures appropriate and respectful image generation

---

## Prompt Optimization Tips

### ✅ DO:
- Specify gender for most accurate results
- Provide height and weight (for BMI calculation)
- Add waist measurements (for clothing fit)
- Include skin tone for realism
- Describe clothing in detail

### ❌ DON'T:
- Use vague descriptions
- Omit gender if you want specific results
- Set height below 150cm (AI safety restriction)
- Use inappropriate or offensive terms
- Expect perfection (AI has limitations)

---

## Technical Implementation

### Backend Code (C#)
```csharp
private string ConstructPrompt(Models.Measurement m, Wardrobe w)
{
    var sb = new StringBuilder();
    
    // 1. Opening with gender
    sb.Append("A professional full-body fashion photograph of an adult ");
    if (!string.IsNullOrEmpty(m.Gender))
    {
        sb.Append($"{m.Gender.ToLower()} ");
    }
    sb.Append("model standing upright. ");
    
    // 2. Environment
    sb.Append("Studio lighting, neutral gray background, fashion photography style. ");
    
    // 3. Skin tone
    if (!string.IsNullOrEmpty(m.SkinColor)) 
        sb.Append($"{m.SkinColor} complexion. ");
    
    // 4. Body proportions with BMI
    sb.Append("Body proportions: ");
    // ... BMI calculation ...
    
    // 5. Gender-specific physique
    if (!string.IsNullOrEmpty(m.Gender))
    {
        if (m.Gender.Equals("Male", StringComparison.OrdinalIgnoreCase))
            sb.Append("Masculine physique. ");
        else if (m.Gender.Equals("Female", StringComparison.OrdinalIgnoreCase))
            sb.Append("Feminine physique. ");
    }
    
    // 6. Clothing description
    // 7. Quality directives
    
    return sb.ToString();
}
```

---

## API Request Flow

1. **User Action**: Clicks "Generate Virtual Try-On" button
2. **Frontend**: Sends `WardrobeId` to backend
3. **Backend**: 
   - Retrieves user's measurements (including gender)
   - Retrieves selected wardrobe outfit
   - Constructs detailed prompt with gender
4. **Vertex AI**: Generates image based on prompt
5. **Response**: Base64 image returned to frontend
6. **Display**: User sees their virtual try-on with gender-appropriate model

---

## Future Enhancements

### Potential Additions:
1. **More Gender Options**: Non-binary, genderfluid, prefer not to say
2. **Body Type Presets**: Pear, apple, hourglass, rectangle, inverted triangle
3. **Pose Selection**: Standing, sitting, walking
4. **Facial Features**: Age range, facial hair, hairstyle
5. **Background Options**: Studio, outdoor, street fashion
6. **Multiple Angles**: Front view, side view, back view
7. **Seasonal Context**: Summer, winter, formal event

### Advanced Prompt Features:
- Lighting mood (dramatic, soft, natural)
- Camera angle (straight-on, 3/4 view)
- Expression (smile, serious, confident)
- Setting context (casual, business, evening wear)

---

## Troubleshooting

### Issue: Generated image doesn't match gender
**Solution**: Ensure gender is saved in measurements and database migration is run.

### Issue: Generic model appears despite gender selection
**Solution**: Check backend logs to verify prompt includes gender. Restart backend if needed.

### Issue: AI refuses to generate image
**Solution**: Check that height is at least 150cm (AI safety requirement).

### Issue: Clothing doesn't fit properly
**Solution**: Provide more detailed measurements (waist, chest, hips) for better results.

---

## Conclusion

Gender is now a key component of the Virtual Try-On AI prompt, enabling:
- ✅ More accurate body representation
- ✅ Gender-appropriate clothing visualization  
- ✅ Realistic virtual try-on results
- ✅ Better user experience and personalization

The system now generates images that truly represent the user!
