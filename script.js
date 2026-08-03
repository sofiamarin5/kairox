const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible')})},{threshold:.14});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const form=document.getElementById('signup');
const note=document.getElementById('note');
const emailInput=document.getElementById('email');

if(form&&note&&emailInput){
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=emailInput.value.trim();
    const button=form.querySelector('button[type="submit"]');
    if(!emailInput.checkValidity()){
      note.textContent='Enter a valid email address.';
      emailInput.reportValidity();
      return;
    }

    const original=button.textContent;
    button.disabled=true;
    button.textContent='Joining…';
    note.textContent='Checking your email…';

    try{
      const response=await fetch('/api/waitlist',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email,source:new URLSearchParams(location.search).get('utm_source')||'website'})
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Could not join the waitlist.');
      note.textContent=data.message||"You're on the Kairox waitlist.";
      form.reset();
    }catch(error){
      note.textContent=error.message||'Something went wrong. Please try again.';
    }finally{
      button.disabled=false;
      button.textContent=original;
    }
  });
}
