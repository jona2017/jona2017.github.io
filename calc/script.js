  // Asegurarse de que el documento esté completamente cargado antes de añadir el evento
  document.addEventListener('DOMContentLoaded', function() {
    // Seleccionamos el botón con la clase '.button'
    var boton = document.querySelector('.miboton');
    
    // Agregamos el evento de clic al botón
    boton.addEventListener('click', function() {
      alert('¡Has hecho clic en el botó asdsadsadn!');
    });
  });


  const calculator = {
    displayEl: document.getElementById('display'),
    currentValue: '0',
    previousValue: null,
    operator: null,
    waitForNewValue: false,
    init: function() {
      this.cacheButtons();
      this.bindEvents();
      this.updateDisplay();
    },
    cacheButtons: function() {
      this.btnClear = document.getElementById('clear');
      this.btnEquals = document.getElementById('equals');
      this.numButtons = document.querySelectorAll('.btn-num');
      this.opButtons = document.querySelectorAll('.btn-op');
    },
    bindEvents: function() {
      this.btnClear.addEventListener('click', () => this.clear());
      this.btnEquals.addEventListener('click', () => this.equals());
      this.numButtons.forEach(btn => {
        btn.addEventListener('click', e => {
          this.appendNumber(e.target.dataset.num);
        });
      });
  
  

    }
}