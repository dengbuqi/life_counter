document.addEventListener('DOMContentLoaded', function () {
    const previousState = loadUserState();
    if (previousState) {
        // Use previous state for further calculations or updates
        // For example, you can call calculateLife() here to recalculate and update the UI
        calculateLife();
    }
    
});


function calculateLife() {
    const birthDate = new Date(document.getElementById('birthDate').value);
    const deathDate = new Date(document.getElementById('deathDate').value);
    const currentDate = new Date();
    const timeUnit = document.getElementById('timeUnit').value;

    let timeUnitInMilliseconds;

    switch (timeUnit) {
        case 'year':
            timeUnitInMilliseconds = 365 * 24 * 60 * 60 * 1000;
            break;
        case 'month':
            timeUnitInMilliseconds = 30 * 24 * 60 * 60 * 1000;
            break;
        case 'week':
            timeUnitInMilliseconds = 7 * 24 * 60 * 60 * 1000;
            break;
        case 'day':
            timeUnitInMilliseconds = 24 * 60 * 60 * 1000;
            break;
        default:
            timeUnitInMilliseconds = 1;
    }

    const weeks = Math.ceil((deathDate - birthDate) / timeUnitInMilliseconds);
    const passedWeeks = Math.ceil((currentDate - birthDate) / timeUnitInMilliseconds);

    const weekContainer = document.getElementById('weekContainer');
    weekContainer.innerHTML = '';

    for (let i = 0; i < weeks; i++) {
        const weekBlock = document.createElement('div');
        weekBlock.className = 'week-block';
        if (i < passedWeeks) {
            weekBlock.classList.add('black');
        } else {
            weekBlock.classList.add('white');
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'block-tooltip';
        
        const weekStartDate = new Date(birthDate.getTime() + i * timeUnitInMilliseconds);
        const formattedDate = getFormattedDate(weekStartDate, timeUnit);
            
        tooltip.innerHTML = `NO. ${i + 1}/${weeks} ${timeUnit} <br> ${formattedDate}<br>`;
        const goalSpan = document.createElement('span');
        goalSpan.className = 'goal-content';
        goalSpan.textContent = ``
        tooltip.appendChild(goalSpan);
        tooltip.appendChild(document.createElement('br'));
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit Goal';
        editBtn.className = 'editButton'
        editBtn.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent the click event from reaching the block
            // const existingGoalSpan = tooltip.querySelector('.goal-content');
            const existingGoal = goalSpan ? goalSpan.textContent.trim() : '';
            const modifiedGoal = prompt('Modify your life goal:', existingGoal);
            if (modifiedGoal !== null) {
                if (goalSpan) {
                    if (modifiedGoal.trim() == ""){
                        weekBlock.classList.remove('red')
                        // Remove the goal from storage when it's empty
                        localStorage.removeItem(`goal_${i}`);
                    }else{
                        weekBlock.classList.add('red');
                        goalSpan.textContent = `${modifiedGoal}`;
                        // Save the modified goal to storage
                        saveGoalToStorage(i, modifiedGoal);
                    }
                }
                
            }
        });
        tooltip.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Goal';
        deleteBtn.className = 'deleteButton'
        deleteBtn.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent the click event from reaching the block
            const deleteGoal = confirm('Do you want to delete the goal?');
            if (deleteGoal) {
                // Reset the goal
                goalSpan.textContent = ``;
                weekBlock.classList.remove('red');
                localStorage.removeItem(`goal_${i}`);
            }
        });
        tooltip.appendChild(deleteBtn);
        weekBlock.appendChild(tooltip);
        // Function to load and display saved goals
        const savedGoal = loadGoalFromStorage(i);
        if (savedGoal) {
            weekBlock.classList.add('red');
            goalSpan.textContent = savedGoal;
        }
        weekContainer.appendChild(weekBlock);
    }
    saveUserState(birthDate, deathDate, timeUnit, weeks);
}

function getFormattedDate(date, unit) {
    switch (unit) {
        case 'year':
            return date.getFullYear().toString();
        case 'month':
            return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        case 'week':
            const weekIndex = getWeekIndexInMonth(date);
            return `${weekIndex} week ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        case 'day':
            return date.toDateString();
        default:
            return '';
    }
}

function getWeekIndexInMonth(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = date.getDay();
    const dayInMonth = date.getDate();

    const firstDayOfWeek = (dayOfWeek - (dayInMonth % 7) + 7) % 7;
    const weekIndex = Math.floor((firstDayOfWeek + dayInMonth - 1) / 7) + 1;

    return weekIndex;
}


// Function to save user's states to local storage
function saveUserState(birthDate, deathDate, timeUnit, weeks) {
    const userState = {
        birthDate: birthDate.toISOString(),  // Convert to ISO string for serialization
        deathDate: deathDate.toISOString(),
        timeUnit: timeUnit,
        weeks: weeks
    };

    localStorage.setItem('userState', JSON.stringify(userState));
}

// Function to load user's states from local storage
function loadUserState() {
    const storedUserState = localStorage.getItem('userState');

    if (storedUserState) {
        const userState = JSON.parse(storedUserState);

        // Set values in the form based on loaded user state
        document.getElementById('birthDate').value = userState.birthDate.slice(0, 10);
        document.getElementById('deathDate').value = userState.deathDate.slice(0, 10);
        document.getElementById('timeUnit').value = userState.timeUnit;

        return userState;
    }

    return null;
}

// Function to save goal to storage for a specific week
function saveGoalToStorage(weekIndex, goal) {
    localStorage.setItem(`goal_${weekIndex}`, goal);
}

// Function to load goal from storage for a specific week
function loadGoalFromStorage(weekIndex) {
    const storedGoal = localStorage.getItem(`goal_${weekIndex}`);
    return storedGoal ? storedGoal : null;
}

function clearStorage(){
    localStorage.clear();
    location.reload();
}