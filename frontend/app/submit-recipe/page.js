'use client';
import { useState, useRef } from 'react';
import { useMealPlannerStore } from '../../lib/store';

export default function SubmitRecipePage() {
  const store = useMealPlannerStore();
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('Dinner');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [caloriesValue, setCaloriesValue] = useState('');
  const [caloriesEstimated, setCaloriesEstimated] = useState(false);
  const [proteinValue, setProteinValue] = useState('');
  const [proteinEstimated, setProteinEstimated] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [addToMyRecipes, setAddToMyRecipes] = useState(true);
  const [legalGrant, setLegalGrant] = useState(false);
  const [legalOriginal, setLegalOriginal] = useState(false);
  const [legalResponsibility, setLegalResponsibility] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const fileRef = useRef(null);

  function showToast(msg, type = 'success') {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      return;
    }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      showToast('Image must be JPG, PNG, or WebP', 'error');
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { showToast('Recipe name is required', 'error'); return; }
    if (!instructions.trim()) { showToast('Instructions are required', 'error'); return; }
    if (!image) { showToast('A recipe photo is required', 'error'); return; }
    if (!legalGrant || !legalOriginal || !legalResponsibility) {
      showToast('All legal agreements must be accepted', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const ingredientsList = ingredients.split('\n').map(s => s.trim()).filter(Boolean);
      const dietList = diet.split(',').map(s => s.trim()).filter(Boolean);

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('instructions', instructions.trim());
      formData.append('category', category);
      formData.append('cuisine', cuisine.trim());
      formData.append('diet', JSON.stringify(dietList));
      formData.append('cookTime', cookTime);
      formData.append('prepTime', prepTime);
      formData.append('servings', servings);
      formData.append('caloriesValue', caloriesValue);
      formData.append('caloriesEstimated', String(caloriesEstimated));
      formData.append('proteinValue', proteinValue);
      formData.append('proteinEstimated', String(proteinEstimated));
      formData.append('submittedBy', 'Anonymous');
      formData.append('ingredients', JSON.stringify(ingredientsList));
      formData.append('addToMyRecipes', String(addToMyRecipes));
      formData.append('image', image);

      const res = await fetch('/api/community/submit', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Submission failed');

      showToast('Submitted for community review!');
      // Reset form
      setName(''); setIngredients(''); setInstructions(''); setCategory('Dinner');
      setCuisine(''); setDiet(''); setCookTime(''); setPrepTime(''); setServings('');
      setCaloriesValue(''); setCaloriesEstimated(false); setProteinValue(''); setProteinEstimated(false);
      setImage(null); setImagePreview(''); setAddToMyRecipes(true);
      setLegalGrant(false); setLegalOriginal(false); setLegalResponsibility(false);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      showToast(err.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFB', padding: '2rem 1rem 4rem' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
          background: toastType === 'error' ? '#DC2626' : '#059669',
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 12,
          fontSize: '0.9rem', fontWeight: 600, zIndex: 200,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', maxWidth: 480, width: '90%',
          textAlign: 'center',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ maxWidth: 680, margin: '0 auto 2rem' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#1A8BA5', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.25rem' }}>
          ← Back to Planner
        </a>
        <h1 style={{ fontWeight: 700, fontSize: '1.75rem', color: '#1E2A33', margin: '0 0 0.375rem' }}>Submit a Recipe</h1>
        <p style={{ color: '#5A7180', fontSize: '0.9rem', margin: 0 }}>Share your recipe with the community. All submissions are reviewed before going live.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Recipe Name */}
        <FieldBox label="Recipe Name *" required>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required
            placeholder="e.g. Grandma's Beef Stew"
            style={inputStyle} />
        </FieldBox>

        {/* Ingredients */}
        <FieldBox label="Ingredients" hint="One ingredient per line">
          <textarea value={ingredients} onChange={e => setIngredients(e.target.value)}
            placeholder={"2 lbs beef chuck\n3 carrots\n1 onion\n2 cups beef broth"}
            rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
        </FieldBox>

        {/* Instructions */}
        <FieldBox label="Instructions *" required hint="Step-by-step directions">
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)} required
            placeholder={"1. Season and sear the beef...\n2. Sauté onions and garlic...\n3. Add broth and simmer for 2 hours..."}
            rows={7} style={{ ...inputStyle, resize: 'vertical' }} />
        </FieldBox>

        {/* Category & Cuisine */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FieldBox label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
            </select>
          </FieldBox>
          <FieldBox label="Cuisine">
            <input type="text" value={cuisine} onChange={e => setCuisine(e.target.value)}
              placeholder="e.g. Italian, Mexican, Asian"
              style={inputStyle} />
          </FieldBox>
        </div>

        {/* Diet Tags */}
        <FieldBox label="Diet Tags" hint="Comma-separated: Vegetarian, Keto, Gluten-Free…">
          <input type="text" value={diet} onChange={e => setDiet(e.target.value)}
            placeholder="Vegetarian, Keto, Gluten-Free"
            style={inputStyle} />
        </FieldBox>

        {/* Times & Servings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <FieldBox label="Prep Time (min)">
            <input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)}
              min="0" placeholder="15" style={inputStyle} />
          </FieldBox>
          <FieldBox label="Cook Time (min)">
            <input type="number" value={cookTime} onChange={e => setCookTime(e.target.value)}
              min="0" placeholder="30" style={inputStyle} />
          </FieldBox>
          <FieldBox label="Servings">
            <input type="number" value={servings} onChange={e => setServings(e.target.value)}
              min="1" placeholder="4" style={inputStyle} />
          </FieldBox>
        </div>

        {/* Calories & Protein */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FieldBox label="Calories">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="number" value={caloriesValue} onChange={e => setCaloriesValue(e.target.value)}
                min="0" placeholder="450" style={{ ...inputStyle, flex: 1 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#5A7180', flexShrink: 0 }}>
                <input type="checkbox" checked={caloriesEstimated} onChange={e => setCaloriesEstimated(e.target.checked)} />
                Est.
              </label>
            </div>
          </FieldBox>
          <FieldBox label="Protein (g)">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="number" value={proteinValue} onChange={e => setProteinValue(e.target.value)}
                min="0" placeholder="32" style={{ ...inputStyle, flex: 1 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#5A7180', flexShrink: 0 }}>
                <input type="checkbox" checked={proteinEstimated} onChange={e => setProteinEstimated(e.target.checked)} />
                Est.
              </label>
            </div>
          </FieldBox>
        </div>

        {/* Image Upload */}
        <FieldBox label="Recipe Photo *" required hint="JPG, PNG, or WebP — max 5MB">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: '0 0 auto' }}>
              <div style={{ width: 100, height: 100, borderRadius: 12, border: '2px dashed #D1E3EA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F7FAFB', overflow: 'hidden' }}>
                {imagePreview ? (
                  <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>+</span>
                    <span style={{ fontSize: '0.7rem', color: '#5A7180' }}>Upload</span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {image && <p style={{ fontSize: '0.8rem', color: '#059669', alignSelf: 'center' }}>{image.name}</p>}
          </div>
        </FieldBox>

        {/* Add to My Recipes */}
        <div style={{ background: '#ffffff', borderRadius: 14, padding: '1rem 1.25rem', border: '1.5px solid #D1E3EA' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={addToMyRecipes} onChange={e => setAddToMyRecipes(e.target.checked)} />
            <span style={{ fontSize: '0.9rem', color: '#1E2A33', fontWeight: 500 }}>Also save a copy to My Recipes</span>
          </label>
        </div>

        {/* Legal Agreements */}
        <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.25rem', border: '1.5px solid #D1E3EA', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#5A7180', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>Required Agreements</p>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={legalGrant} onChange={e => setLegalGrant(e.target.checked)} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#1E2A33', lineHeight: 1.5 }}>I grant <strong>LogBook Labs</strong> full rights to use this recipe and photo in the Meal Planner app and related materials.</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={legalOriginal} onChange={e => setLegalOriginal(e.target.checked)} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#1E2A33', lineHeight: 1.5 }}>The photo is my original work and is not copyrighted by anyone else.</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={legalResponsibility} onChange={e => setLegalResponsibility(e.target.checked)} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#1E2A33', lineHeight: 1.5 }}>I take full responsibility for any copyrighted material in my submission.</span>
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={submitting}
          style={{
            padding: '1rem',
            background: submitting ? '#D1E3EA' : '#1A8BA5',
            color: submitting ? '#5A7180' : '#ffffff',
            border: 'none', borderRadius: 12,
            fontSize: '1rem', fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 2px 8px rgba(26,139,165,0.25)',
          }}>
          {submitting ? 'Submitting…' : 'Submit for Community Review'}
        </button>
      </form>
    </div>
  );
}

function FieldBox({ label, hint, required, children }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: 14, padding: '1rem 1.25rem', border: '1.5px solid #D1E3EA' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.625rem' }}>
        <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1E2A33' }}>{label}</label>
        {required && <span style={{ color: '#F43F5E', fontSize: '0.75rem' }}>*</span>}
        {hint && !required && <span style={{ color: '#5A7180', fontSize: '0.75rem' }}>— {hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.625rem 0.875rem',
  border: '1.5px solid #D1E3EA', borderRadius: 10,
  fontSize: '0.9rem', color: '#1E2A33', outline: 'none',
  boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", background: '#F7FAFB',
};
