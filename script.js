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
                posto.textContent = name[0]; // Mostra l'iniziale del nome
                names[i] = name;
                posto.dataset.name = name;
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

    // Trascinamento del tavolo
    table.addEventListener('mousedown', function(e) {
        let shiftX = e.clientX - table.getBoundingClientRect().left;
        let shiftY = e.clientY - table.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            table.style.left = pageX - shiftX + 'px';
            table.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', function() {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });

    table.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showTableControls(table, document.getElementById('canvas'));
    });

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


document.getElementById('exportPdfBtn').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const canvas = document.getElementById('canvas');
    const tables = canvas.querySelectorAll('.tavolo');

    tables.forEach((table, index) => {
        const tableLabel = table.querySelector('div').textContent;
        const seats = Array.from(table.querySelectorAll('.posto')).map(posto => posto.dataset.name || 'Vuoto');
        const numSeats = seats.length;

        doc.text(`Tavolo: ${tableLabel} - ${numSeats} partecipanti`, 10, 10 + (index * 30));

        seats.forEach((seat, idx) => {
            doc.text(`${seat}`, 20, 20 + (index * 30) + (idx * 10));
        });
    });

    doc.save('disposizione_tavoli.pdf');
});

document.getElementById('saveConfigBtn').addEventListener('click', function() {
    const canvas = document.getElementById('canvas');
    const tables = canvas.querySelectorAll('.tavolo');

    const config = [];

    tables.forEach((table) => {
        const tableLabel = table.querySelector('div').textContent;
        const seats = Array.from(table.querySelectorAll('.posto')).map(posto => ({
            name: posto.dataset.name || '',
            position: {
                left: posto.style.left,
                top: posto.style.top
            }
        }));

        config.push({
            name: tableLabel,
            position: {
                top: table.style.top,
                left: table.style.left
            },
            seats
        });
    });

    localStorage.setItem('tableConfig', JSON.stringify(config));
    alert('Configurazione salvata!');
});

window.addEventListener('load', function() {
    const config = JSON.parse(localStorage.getItem('tableConfig'));
    if (config) {
        config.forEach(tableConfig => {
            let table = document.createElement('div');
            table.className = 'tavolo';
            table.style.width = '100px';
            table.style.height = '100px';
            table.style.top = tableConfig.position.top;
            table.style.left = tableConfig.position.left;
            table.style.position = 'absolute';
            table.innerHTML = `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">${tableConfig.name}</div>`;

            tableConfig.seats.forEach((seatConfig, i) => {
                let posto = document.createElement('div');
                posto.className = 'posto';
                posto.style.left = seatConfig.position.left;
                posto.style.top = seatConfig.position.top;
                posto.textContent = seatConfig.name ? seatConfig.name[0] : '';
                posto.dataset.name = seatConfig.name;

                posto.addEventListener('click', function() {
                    let name = prompt('Inserisci il nome del partecipante:', posto.dataset.name || '');
                    if (name) {
                        posto.textContent = name[0];
                        posto.dataset.name = name;
                    }
                });

                posto.addEventListener('mouseenter', function() {
                    if (posto.dataset.name) {
                        posto.title = posto.dataset.name;
                    }
                });

                table.appendChild(posto);
            });

            table.addEventListener('mousedown', function(e) {
                let shiftX = e.clientX - table.getBoundingClientRect().left;
                let shiftY = e.clientY - table.getBoundingClientRect().top;

                function moveAt(pageX, pageY) {
                    table.style.left = pageX - shiftX + 'px';
                    table.style.top = pageY - shiftY + 'px';
                }

                function onMouseMove(event) {
                    moveAt(event.pageX, event.pageY);
                }

                document.addEventListener('mousemove', onMouseMove);

                document.addEventListener('mouseup', function() {
                    document.removeEventListener('mousemove', onMouseMove);
                }, { once: true });
            });

            table.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showTableControls(table, document.getElementById('canvas'));
            });

            document.getElementById('canvas').appendChild(table);
        });
    }
});

document.getElementById('deleteConfigBtn').addEventListener('click', function() {
    localStorage.removeItem('tableConfig');
    alert('Configurazione eliminata!');
    location.reload(); // Ricarica la pagina per riflettere l'eliminazione
});

let scale = 1;
document.getElementById('zoomInBtn').addEventListener('click', function() {
    scale += 0.1;
    document.getElementById('canvas').style.transform = `scale(${scale})`;
});

document.getElementById('zoomOutBtn').addEventListener('click', function() {
    scale -= 0.1;
    document.getElementById('canvas').style.transform = `scale(${scale})`;
});
