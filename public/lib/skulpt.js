window.Sk = {};
(() => {
   const script = document.createElement('script');
   script.src = 'https://cdnjs.cloudflare.com/ajax/libs/skulpt/1.2.0/skulpt.min.js';
   script.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/skulpt/1.2.0/skulpt-stdlib.min.js';
      script2.onload = () => {
         window.Sk.configure({
            output: (text) => {
               const outputDiv = document.getElementById('skulpt-output');
               if (outputDiv) {
                  outputDiv.textContent += text;
               }
            },
            read: (prompt) => {
               return new Promise((resolve) => {
                  const userInput = window.prompt(prompt);
                  resolve(userInput);
               });
            },
         });
      };
      document.body.appendChild(script2);
   };
   document.body.appendChild(script);
})();
