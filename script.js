document.getElementById('addTableBtn').addEventListener('click', function() {
    let posti = prompt('Quanti posti deve avere il tavolo?');
    let tableName = prompt('Inserisci il nome del tavolo:');

    if (!posti || isNaN(posti) || posti < 1 || !tableName) {
        alert('Inserisci valori validi.');
        return;
    }

    let table = document.createElement('div');
    table.className = 'tavolo';
    table.style.left = '50%';
    table.style.top = '50%';
    table.style.transform = 'translate(-50%, -50%)';

    let tableLabel = document.createElement('div');
    tableLabel.style.position = 'absolute';
    tableLabel.style.top = '50%';
    tableLabel.style.left = '50%';
    tableLabel.style.transform = 'translate(-50%, -50%)';
    tableLabel.textContent = tableName;
    table.appendChild(tableLabel);

    let tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    table.appendChild(tooltip);

    let names = Array(posti).fill("Vuoto");

    for (let i = 0; i < posti; i++) {
        let angle = (i / posti) * 2 * Math.PI;
        let posto = document.createElement('div');
        posto.className = 'posto';
        posto.style.left = (50 + 40 * Math.cos(angle)) + '%';
        posto.style.top = (50 + 40 * Math.sin(angle)) + '%';
        posto.addEventListener('click', function() {
            let name = prompt('Inserisci il nome del partecipante:');
            if (name) {
                posto.textContent = name[0];
                posto.dataset.name = name;
                names[i] = name;
                updateTooltip();
            }
        });
        table.appendChild(posto);
    }

    function updateTooltip() {
        tooltip.innerHTML = names.join('<br>');
    }

    // Mostra il tooltip con doppio clic
    table.addEventListener('dblclick', function() {
        tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
    });

    // Trascinamento del tavolo (supporto per mouse e touch)
    table.addEventListener('mousedown', startDrag);
    table.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        e.preventDefault();

        let startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        let shiftX = startX - table.getBoundingClientRect().left;
        let shiftY = startY - table.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            table.style.left = pageX - shiftX + 'px';
            table.style.top = pageY - shiftY + 'px';
        }

        function onMove(e) {
            let moveX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            let moveY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            moveAt(moveX, moveY);
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });

        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMove);
        }, { once: true });

        document.addEventListener('touchend', () => {
            document.removeEventListener('touchmove', onMove);
        }, { once: true });
    }

    // Aggiungi il pulsante delle opzioni
    let optionsBtn = document.createElement('button');
    optionsBtn.className = 'options-btn';
    optionsBtn.textContent = '+';
    optionsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showTableControls(table, document.getElementById('canvas'));
    });
    table.appendChild(optionsBtn);

    document.getElementById('canvas').appendChild(table);
});

function showTableControls(table, canvas) {
    let controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';

    let removeTableBtn = document.createElement('button');
    removeTableBtn.textContent = 'Rimuovi Tavolo';
    removeTableBtn.addEventListener('click', function() {
        canvas.removeChild(table);
        document.body.removeChild(controlsContainer);
    });

    let editTableBtn = document.createElement('button');
    editTableBtn.textContent = 'Modifica Nome Tavolo';
    editTableBtn.addEventListener('click', function() {
        let newName = prompt('Inserisci il nuovo nome del tavolo:', table.querySelector('div').textContent);
        if (newName) {
            table.querySelector('div').textContent = newName;
        }
    });

    let addSeatBtn = document.createElement('button');
    addSeatBtn.textContent = 'Aggiungi Posto';
    addSeatBtn.addEventListener('click', function() {
        addSeatsToTable(table, 1);
        document.body.removeChild(controlsContainer);
    });

    let removeSeatBtn = document.createElement('button');
    removeSeatBtn.textContent = 'Rimuovi Posto';
    removeSeatBtn.addEventListener('click', function() {
        removeSeatsFromTable(table, 1);
        document.body.removeChild(controlsContainer);
    });

    controlsContainer.appendChild(editTableBtn);
    controlsContainer.appendChild(removeTableBtn);
    controlsContainer.appendChild(addSeatBtn);
    controlsContainer.appendChild(removeSeatBtn);

    document.body.appendChild(controlsContainer);

    let rect = table.getBoundingClientRect();
    controlsContainer.style.top = rect.top + 'px';
    controlsContainer.style.left = rect.right + 10 + 'px';

    document.addEventListener('click', function handleClickOutside(event) {
        if (!controlsContainer.contains(event.target) && !table.contains(event.target)) {
            document.body.removeChild(controlsContainer);
            document.removeEventListener('click', handleClickOutside);
        }
    });
}

function addSeatsToTable(table, numberOfSeats) {
    let existingSeats = table.querySelectorAll('.posto').length;
    let newTotalSeats = existingSeats + numberOfSeats;
    let names = Array.from(table.querySelectorAll('.posto')).map(posto => posto.dataset.name || "Vuoto");

    for (let i = existingSeats; i < newTotalSeats; i++) {
        let angle = (i / newTotalSeats) * 2 * Math.PI;
        let posto = document.createElement('div');
        posto.className = 'posto';
        posto.style.left = (50 + 40 * Math.cos(angle)) + '%';
        posto.style.top = (50 + 40 * Math.sin(angle)) + '%';

        posto.addEventListener('click', function() {
            let name = prompt('Inserisci il nome del partecipante:');
            if (name) {
                posto.textContent = name[0];
                posto.dataset.name = name;
                names[i] = name;
                updateTooltip(table, names);
            }
        });

        posto.addEventListener('mouseenter', function() {
            if (posto.dataset.name) {
                posto.title = posto.dataset.name;
            }
        });

        table.appendChild(posto);
    }

    updateSeatPositions(table, newTotalSeats);
    updateTooltip(table, names);
}

function removeSeatsFromTable(table, numberOfSeats) {
    let seats = Array.from(table.querySelectorAll('.posto'));
    let seatsToRemove = seats.slice(-numberOfSeats);

    seatsToRemove.forEach(seat => table.removeChild(seat));

    let newTotalSeats = seats.length - numberOfSeats;
    let names = seats.slice(0, newTotalSeats).map(posto => posto.dataset.name || "Vuoto");

    updateSeatPositions(table, newTotalSeats);
    updateTooltip(table, names);
}

function updateSeatPositions(table, totalSeats) {
    let seats = table.querySelectorAll('.posto');
    seats.forEach((posto, i) => {
        let angle = (i / totalSeats) * 2 * Math.PI;
        posto.style.left = (50 + 40 * Math.cos(angle)) + '%';
        posto.style.top = (50 + 40 * Math.sin(angle)) + '%';
    });
}

function updateTooltip(table, names) {
    let tooltip = table.querySelector('.tooltip');
    tooltip.innerHTML = names.join('<br>');
}
