const API_URL = "http://localhost:5001/api/tasks";

const taskContainer = document.getElementById("taskContainer");

const addTaskBtn = document.getElementById("addTaskBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");

const modalTitle = document.getElementById("modalTitle");

const taskId = document.getElementById("taskId");
const title = document.getElementById("title");
const description = document.getElementById("description");
const status = document.getElementById("status");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

let tasks = [];


// ================================
// LOAD TASKS
// ================================

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.success) {
            tasks = data.tasks;

            displayTasks(tasks);
            updateStatistics(tasks);
        }
    } catch (error) {
        console.error("Error loading tasks:", error);

        taskContainer.innerHTML = `
            <div class="task-card">
                <h3>Unable to load tasks</h3>
                <p>Make sure the backend server is running.</p>
            </div>
        `;
    }
}


// ================================
// DISPLAY TASKS
// ================================

function displayTasks(taskList) {

    taskContainer.innerHTML = "";

    if (taskList.length === 0) {

        taskContainer.innerHTML = `
            <div class="task-card empty-state">
                <h3>No tasks found</h3>
                <p>Create a new task to get started.</p>
            </div>
        `;

        return;
    }


    taskList.forEach((task) => {

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";


        const dueDateHTML = task.dueDate
            ? `
                <span class="badge">
                    Due: ${formatDate(task.dueDate)}
                </span>
              `
            : "";


        taskCard.innerHTML = `

            <h3>${escapeHTML(task.title)}</h3>

            <p>
                ${escapeHTML(task.description || "No description")}
            </p>

            <div class="task-meta">

                <span class="badge">
                    ${escapeHTML(task.status)}
                </span>

                <span class="badge">
                    ${escapeHTML(task.priority)}
                </span>

                ${dueDateHTML}

            </div>


            <div class="task-actions">

                <button
                    type="button"
                    class="btn edit-btn"
                    data-id="${task._id}"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="btn delete-btn"
                    data-id="${task._id}"
                >
                    Delete
                </button>

            </div>

        `;


        const editButton =
            taskCard.querySelector(".edit-btn");

        const deleteButton =
            taskCard.querySelector(".delete-btn");


        editButton.addEventListener("click", () => {
            editTask(task._id);
        });


        deleteButton.addEventListener("click", () => {
            deleteTask(task._id);
        });


        taskContainer.appendChild(taskCard);
    });
}


// ================================
// ESCAPE HTML
// ================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ================================
// STATISTICS
// ================================

function updateStatistics(taskList) {

    const total = taskList.length;

    const todo = taskList.filter(
        task => task.status === "To Do"
    ).length;

    const progress = taskList.filter(
        task => task.status === "In Progress"
    ).length;

    const completed = taskList.filter(
        task => task.status === "Completed"
    ).length;


    document.getElementById("totalTasks").textContent = total;

    document.getElementById("todoTasks").textContent = todo;

    document.getElementById("progressTasks").textContent = progress;

    document.getElementById("completedTasks").textContent = completed;
}


// ================================
// OPEN ADD MODAL
// ================================

function openAddTaskModal() {

    modalTitle.textContent = "Add Task";

    taskForm.reset();

    taskId.value = "";

    status.value = "To Do";

    priority.value = "Medium";

    taskModal.classList.remove("hidden");
}


// ================================
// CLOSE MODAL
// ================================

function closeModal() {

    taskModal.classList.add("hidden");
}


// ================================
// CREATE / UPDATE TASK
// ================================

taskForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const taskData = {

        title: title.value.trim(),

        description: description.value.trim(),

        status: status.value,

        priority: priority.value,

        dueDate: dueDate.value || undefined
    };


    if (!taskData.title) {

        alert("Please enter a task title.");

        return;
    }


    try {

        let response;


        if (taskId.value) {

            response = await fetch(
                `${API_URL}/${taskId.value}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(taskData)
                }
            );

        } else {

            response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(taskData)
                }
            );
        }


        const data = await response.json();


        if (!response.ok) {

            alert(data.message || "Something went wrong.");

            return;
        }


        closeModal();

        await loadTasks();

    } catch (error) {

        console.error("Error saving task:", error);

        alert("Unable to connect to the backend.");
    }
});


// ================================
// EDIT TASK
// ================================

async function editTask(id) {

    try {

        const response =
            await fetch(`${API_URL}/${id}`);


        const data =
            await response.json();


        if (!data.success) {

            alert(data.message);

            return;
        }


        const task = data.task;


        modalTitle.textContent = "Edit Task";


        taskId.value = task._id;

        title.value = task.title;

        description.value =
            task.description || "";

        status.value = task.status;

        priority.value = task.priority;


        if (task.dueDate) {

            dueDate.value =
                task.dueDate.split("T")[0];

        } else {

            dueDate.value = "";
        }


        taskModal.classList.remove("hidden");

    } catch (error) {

        console.error("Error loading task:", error);

        alert("Unable to load task.");
    }
}


// ================================
// DELETE TASK
// ================================

async function deleteTask(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        await loadTasks();

    } catch (error) {

        console.error("Error deleting task:", error);

        alert("Unable to delete task.");
    }
}


// ================================
// SEARCH + FILTER
// ================================

function applyFilters() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedStatus =
        statusFilter.value;

    const selectedPriority =
        priorityFilter.value;


    const filteredTasks =
        tasks.filter((task) => {

            const titleMatch =
                task.title
                    .toLowerCase()
                    .includes(searchText);


            const descriptionMatch =
                (task.description || "")
                    .toLowerCase()
                    .includes(searchText);


            const statusMatch =
                selectedStatus === "all" ||
                task.status === selectedStatus;


            const priorityMatch =
                selectedPriority === "all" ||
                task.priority === selectedPriority;


            return (
                (titleMatch || descriptionMatch) &&
                statusMatch &&
                priorityMatch
            );
        });


    displayTasks(filteredTasks);
}


// ================================
// DATE FORMAT
// ================================

function formatDate(date) {

    return new Date(date)
        .toLocaleDateString();
}


// ================================
// EVENT LISTENERS
// ================================

addTaskBtn.addEventListener(
    "click",
    openAddTaskModal
);


closeModalBtn.addEventListener(
    "click",
    closeModal
);


cancelBtn.addEventListener(
    "click",
    closeModal
);


searchInput.addEventListener(
    "input",
    applyFilters
);


statusFilter.addEventListener(
    "change",
    applyFilters
);


priorityFilter.addEventListener(
    "change",
    applyFilters
);


// ================================
// START APP
// ================================

loadTasks();
