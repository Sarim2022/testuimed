document.addEventListener('DOMContentLoaded', () => {
    // Navigation handling
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const views = document.querySelectorAll('.view');
    const addButton = document.getElementById('add-button');
    const addModal = document.getElementById('add-modal');
    const waterModal = document.getElementById('water-modal');
    const medicineModal = document.getElementById('medicine-modal');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const modalOptions = document.querySelectorAll('.modal-option');
    const waterForm = document.getElementById('water-form');
    const medicineForm = document.getElementById('medicine-form');
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    let currentModal = null;

    // View switching function
    function switchView(viewId) {
        views.forEach(view => view.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active'));
        
        document.getElementById(`${viewId}-view`).classList.add('active');
        document.querySelector(`.nav-item[data-view="${viewId}"]`).classList.add('active');
    }

    // Navigation click handlers
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            switchView(viewId);
        });
    });

    // Modal handling
    function toggleModal(modal, show = true) {
        if (!modal) return;
        currentModal = show ? modal : null;
        if (show) {
            modal.style.display = 'flex';
            requestAnimationFrame(() => {
                modal.classList.add('active');
            });
        } else {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                if (modal.contains(waterForm)) waterForm.reset();
                if (modal.contains(medicineForm)) medicineForm.reset();
            }, 300);
        }
    }

    // Add button click handler
    addButton.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(addModal, true);
    });

    // Modal overlays click handler (close modals)
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            if (currentModal) toggleModal(currentModal, false);
        });
    });

    // Modal option click handlers
    modalOptions.forEach(option => {
        option.addEventListener('click', () => {
            const targetModalId = option.getAttribute('data-modal');
            const targetModal = document.getElementById(targetModalId);
            toggleModal(addModal, false);
            setTimeout(() => toggleModal(targetModal, true), 300);
        });
    });

    // Cancel buttons click handlers
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentModal) toggleModal(currentModal, false);
        });
    });

    // Form submit handlers
    waterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(waterForm);
        const reminder = {
            type: 'water',
            glasses: formData.get('glasses'),
            time: formData.get('reminder-time'),
            days: formData.getAll('days'),
            startDate: formData.get('start-date'),
            endDate: formData.get('end-date')
        };
        addReminder(reminder);
        toggleModal(waterModal, false);
    });

    medicineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(medicineForm);
        const reminder = {
            type: 'medicine',
            name: formData.get('medicine-name'),
            dosage: {
                amount: formData.get('dosage-amount'),
                type: formData.get('dosage-type')
            },
            time: formData.get('reminder-time'),
            days: formData.getAll('days'),
            startDate: formData.get('start-date'),
            endDate: formData.get('end-date')
        };
        addReminder(reminder);
        toggleModal(medicineModal, false);
    });

    // Clear existing medicine cards on load
    document.querySelector('.medicine-cards').innerHTML = '';

    // Medicine type configurations
    const medicineTypes = {
        pills: {
            icon: 'img/pills.png',
            backgroundColor: '#FFFBE0'
        },
        drops: {
            icon: 'img/doasge.png',
            backgroundColor: '#FFE6E8'
        },
        ml: {
            icon: 'img/ml.png',
            backgroundColor: '#E8FFE6'
        }
    };

    function formatTime(timeString) {
        const date = new Date();
        const [hours, minutes] = timeString.split(':');
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    }

    function isToday(dateString) {
        const today = new Date();
        const date = new Date(dateString);
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    function addReminder(reminder) {
        const medicineCards = document.querySelector('.medicine-cards');
        let cardStyle = '';
        let iconSrc = '';
        const isReminderForToday = isToday(reminder.startDate);

        if (reminder.type === 'water') {
            cardStyle = 'blue';
            iconSrc = 'img/water.svg';
        } else {
            cardStyle = reminder.dosage.type;
            iconSrc = medicineTypes[reminder.dosage.type].icon;
        }

        const cardTemplate = `
            <div class="medicine-card ${isReminderForToday ? 'today-reminder' : ''}" 
                style="background-color: ${reminder.type === 'water' ? '#E6F4FF' : medicineTypes[reminder.dosage.type].backgroundColor};
                       ${isReminderForToday ? 'box-shadow: 0 0 15px rgba(0, 191, 165, 0.3); border: 2px solid #00BFA5;' : ''}">
                <div class="time">${formatTime(reminder.time)}</div>
                <div class="med-info">
                    <h4>${reminder.type === 'water' ? 
                        `Drink ${reminder.glasses} glass${reminder.glasses > 1 ? 'es' : ''} of water` : 
                        reminder.name}</h4>
                    ${reminder.type === 'medicine' ? 
                        `<small>Take ${reminder.dosage.amount} ${reminder.dosage.type}</small>` : ''}
                </div>
                <img src="${iconSrc}" alt="${reminder.type}" class="med-icon">
            </div>
        `;
        medicineCards.insertAdjacentHTML('beforeend', cardTemplate);
    }

    // Initialize with home view
    switchView('home');
});
function addTask(taskName, taskTime) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("You must be logged in to add tasks.");
        return;
    }

    const taskRef = firebase.database().ref("tasks/" + user.uid).push();
    taskRef.set({
        name: taskName,
        time: taskTime
    });

    console.log("Task added!");
}
function loadTasks(uid) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = ""; // Clear previous tasks

    const taskRef = firebase.database().ref("tasks/" + uid);
    
    taskRef.on("value", (snapshot) => {
        taskList.innerHTML = ""; // Clear the task list before loading new tasks
        snapshot.forEach((childSnapshot) => {
            let task = childSnapshot.val();
            let listItem = document.createElement("li");
            listItem.textContent = `${task.name} - ${task.time}`;
            taskList.appendChild(listItem);
        });
    });
}
document.getElementById("water-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const glasses = document.querySelector('select[name="glasses"]').value;
    const time = document.querySelector('input[name="reminder-time"]').value;
    const days = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(d => d.value);

    await addDoc(collection(db, "reminders"), {
        userId: user.uid,
        type: "water",
        name: `Drink ${glasses} Glasses of Water`,
        details: `At ${time}`,
        time: time,
        days: days
    });

    alert("Water reminder added!");
    loadUserReminders(user.uid);
});

document.getElementById("medicine-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const medName = document.querySelector('input[name="medicine-name"]').value;
    const dosage = document.querySelector('input[name="dosage-amount"]').value;
    const dosageType = document.querySelector('select[name="dosage-type"]').value;
    const time = document.querySelector('input[name="reminder-time"]').value;
    const days = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(d => d.value);

    await addDoc(collection(db, "reminders"), {
        userId: user.uid,
        type: "medicine",
        name: medName,
        details: `Take ${dosage} ${dosageType} at ${time}`,
        time: time,
        days: days
    });

    alert("Medicine reminder added!");
    loadUserReminders(user.uid);
});
