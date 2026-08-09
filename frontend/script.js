// =========================================
// TASK MANAGEMENT APP
// =========================================


// =========================================
// API
// =========================================

const API_URL =
"https://task-management-app-oj6o.onrender.com/api/tasks"

// =========================================
// AUTHENTICATION
// =========================================

const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "login.html";
}


// =========================================
// DOM ELEMENTS
// =========================================

const taskContainer =
    document.getElementById(
        "taskContainer"
    );

const addTaskBtn =
    document.getElementById(
        "addTaskBtn"
    );

const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );

const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );

const taskModal =
    document.getElementById(
        "taskModal"
    );

const taskForm =
    document.getElementById(
        "taskForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const taskId =
    document.getElementById(
        "taskId"
    );

const title =
    document.getElementById(
        "title"
    );

const description =
    document.getElementById(
        "description"
    );

const status =
    document.getElementById(
        "status"
    );

const priority =
    document.getElementById(
        "priority"
    );

const dueDate =
    document.getElementById(
        "dueDate"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const priorityFilter =
    document.getElementById(
        "priorityFilter"
    );


// =========================================
// TASK STATE
// =========================================

let tasks = [];


// =========================================
// AUTHENTICATED FETCH
// =========================================

async function authenticatedFetch(
    url,
    options = {}
) {

    const currentToken =
        localStorage.getItem(
            "token"
        );


    if (!currentToken) {

        window.location.href =
            "login.html";

        return null;
    }


    const headers = {

        ...(options.headers || {}),

        "Authorization":
            `Bearer ${currentToken}`
    };


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "login.html";

        return null;
    }


    return response;
}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// =========================================
// TOAST
// =========================================

function showToast(
    message,
    type = "success"
) {

    const oldToast =
        document.querySelector(
            ".toast"
        );


    if (oldToast) {

        oldToast.remove();
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast toast-${type}`;


    const icon =
        type === "success"
            ? "✓"
            : type === "error"
                ? "✕"
                : "ℹ";


    toast.innerHTML = `

        <span class="toast-icon">
            ${icon}
        </span>

        <span class="toast-message">
            ${escapeHTML(message)}
        </span>

    `;


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.classList.add(
                "toast-hide"
            );


            setTimeout(
                () => {

                    toast.remove();

                },
                300
            );

        },
        3000
    );
}


// =========================================
// LOADING
// =========================================

function showLoading() {

    taskContainer.innerHTML = `

        <div class="loading-state">

            <div class="loading-spinner"></div>

            <p>
                Loading tasks...
            </p>

        </div>

    `;
}


// =========================================
// LOAD TASKS
// =========================================

async function loadTasks(
    showLoader = true
) {

    try {

        if (showLoader) {

            showLoading();
        }


        const response =
            await authenticatedFetch(
                API_URL
            );


        if (!response) {

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to fetch tasks"
            );
        }


        if (data.success) {

            tasks =
                data.tasks || [];


            displayTasks(
                tasks
            );


            updateStatistics(
                tasks
            );

        } else {

            throw new Error(
                data.message ||
                "Failed to load tasks"
            );
        }


    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );


        taskContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    Unable to load tasks
                </h3>

                <p>
                    Please check your server and try again.
                </p>

            </div>

        `;


        showToast(
            "Unable to load tasks.",
            "error"
        );
    }
}


// =========================================
// DISPLAY TASKS
// =========================================

function displayTasks(
    taskList
) {

    taskContainer.innerHTML =
        "";


    if (
        taskList.length === 0
    ) {

        taskContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    No tasks found
                </h3>

                <p>
                    Create a new task to get started.
                </p>

            </div>

        `;

        return;
    }


    taskList.forEach(
        task => {

            const taskCard =
                document.createElement(
                    "div"
                );


            taskCard.className =
                "task-card";


            const dueDateHTML =
                task.dueDate
                    ? `

                        <span
                            class="badge due-badge"
                        >

                            Due:
                            ${formatDate(
                                task.dueDate
                            )}

                        </span>

                    `
                    : "";


            // =================================
            // PROFESSIONAL TASK CARD
            // =================================

            taskCard.innerHTML = `

                <div class="task-card-header">

                    <div class="task-title-area">

                        <div class="task-check">

                            ${
                                task.status ===
                                "Completed"
                                    ? "✓"
                                    : "○"
                            }

                        </div>


                        <div>

                            <h3>

                                ${escapeHTML(
                                    task.title
                                )}

                            </h3>


                            <p>

                                ${escapeHTML(
                                    task.description ||
                                    "No description"
                                )}

                            </p>

                        </div>

                    </div>

                </div>


                <div class="task-meta">

                    <span
                        class="badge status-badge
                        ${getStatusClass(
                            task.status
                        )}"
                    >

                        ${escapeHTML(
                            task.status
                        )}

                    </span>


                    <span
                        class="badge priority-badge
                        ${getPriorityClass(
                            task.priority
                        )}"
                    >

                        ${escapeHTML(
                            task.priority
                        )}

                    </span>


                    ${dueDateHTML}

                </div>


                <div class="task-divider"></div>


                <div class="task-actions">

                    <button
                        type="button"
                        class="btn edit-btn"
                    >

                        ✏️ Edit

                    </button>


                    <button
                        type="button"
                        class="btn delete-btn"
                    >

                        🗑️ Delete

                    </button>

                </div>

            `;


            // =================================
            // EDIT BUTTON
            // =================================

            const editButton =
                taskCard.querySelector(
                    ".edit-btn"
                );


            editButton.addEventListener(
                "click",
                () => {

                    editTask(
                        task._id
                    );

                }
            );


            // =================================
            // DELETE BUTTON
            // =================================

            const deleteButton =
                taskCard.querySelector(
                    ".delete-btn"
                );


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTask(
                        task._id
                    );

                }
            );


            taskContainer.appendChild(
                taskCard
            );

        }
    );
}


// =========================================
// STATUS CLASS
// =========================================

function getStatusClass(
    taskStatus
) {

    if (
        taskStatus === "To Do"
    ) {

        return "status-todo";
    }


    if (
        taskStatus === "In Progress"
    ) {

        return "status-progress";
    }


    if (
        taskStatus === "Completed"
    ) {

        return "status-completed";
    }


    return "";
}


// =========================================
// PRIORITY CLASS
// =========================================

function getPriorityClass(
    taskPriority
) {

    if (
        taskPriority === "Low"
    ) {

        return "priority-low";
    }


    if (
        taskPriority === "Medium"
    ) {

        return "priority-medium";
    }


    if (
        taskPriority === "High"
    ) {

        return "priority-high";
    }


    return "";
}


// =========================================
// STATISTICS
// =========================================

function updateStatistics(
    taskList
) {

    const total =
        taskList.length;


    const todo =
        taskList.filter(
            task =>
                task.status ===
                "To Do"
        ).length;


    const progress =
        taskList.filter(
            task =>
                task.status ===
                "In Progress"
        ).length;


    const completed =
        taskList.filter(
            task =>
                task.status ===
                "Completed"
        ).length;


    animateStat(
        "totalTasks",
        total
    );


    animateStat(
        "todoTasks",
        todo
    );


    animateStat(
        "progressTasks",
        progress
    );


    animateStat(
        "completedTasks",
        completed
    );
}


// =========================================
// STATISTICS ANIMATION
// =========================================

function animateStat(
    elementId,
    targetValue
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;
    }


    const duration =
        500;


    const startValue =
        0;


    const startTime =
        performance.now();


    function update(
        currentTime
    ) {

        const elapsed =
            currentTime -
            startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const easedProgress =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const currentValue =
            Math.floor(
                startValue +
                (
                    targetValue -
                    startValue
                ) *
                easedProgress
            );


        element.textContent =
            currentValue;


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                update
            );

        } else {

            element.textContent =
                targetValue;
        }
    }


    requestAnimationFrame(
        update
    );
}


// =========================================
// OPEN ADD TASK MODAL
// =========================================

function openAddTaskModal() {

    modalTitle.textContent =
        "Add Task";


    taskForm.reset();


    taskId.value =
        "";


    status.value =
        "To Do";


    priority.value =
        "Medium";


    taskModal.classList.remove(
        "hidden"
    );


    setTimeout(
        () => {

            title.focus();

        },
        100
    );
}


// =========================================
// CLOSE MODAL
// =========================================

function closeModal() {

    taskModal.classList.add(
        "hidden"
    );
}


// =========================================
// CREATE / UPDATE TASK
// =========================================

taskForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const taskData = {

            title:
                title.value.trim(),

            description:
                description.value.trim(),

            status:
                status.value,

            priority:
                priority.value,

            dueDate:
                dueDate.value ||
                undefined

        };


        if (
            !taskData.title
        ) {

            showToast(
                "Please enter a task title.",
                "error"
            );

            return;
        }


        try {

            const isEditing =
                Boolean(
                    taskId.value
                );


            let response;


            if (isEditing) {

                response =
                    await authenticatedFetch(

                        `${API_URL}/${taskId.value}`,

                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    taskData
                                )
                        }
                    );

            } else {

                response =
                    await authenticatedFetch(

                        API_URL,

                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    taskData
                                )
                        }
                    );
            }


            if (!response) {

                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                showToast(
                    data.message ||
                    "Something went wrong.",
                    "error"
                );

                return;
            }


            closeModal();


            await loadTasks(
                false
            );


            showToast(

                isEditing
                    ? "Task updated successfully."
                    : "Task created successfully.",

                "success"
            );


        } catch (error) {

            console.error(
                "Error saving task:",
                error
            );


            showToast(
                "Unable to connect to server.",
                "error"
            );
        }
    }
);


// =========================================
// EDIT TASK
// =========================================

async function editTask(
    id
) {

    try {

        const response =
            await authenticatedFetch(
                `${API_URL}/${id}`
            );


        if (!response) {

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to load task.",
                "error"
            );

            return;
        }


        const task =
            data.task;


        modalTitle.textContent =
            "Edit Task";


        taskId.value =
            task._id;


        title.value =
            task.title || "";


        description.value =
            task.description || "";


        status.value =
            task.status ||
            "To Do";


        priority.value =
            task.priority ||
            "Medium";


        dueDate.value =
            task.dueDate
                ? task.dueDate.split("T")[0]
                : "";


        taskModal.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Error editing task:",
            error
        );


        showToast(
            "Unable to load task.",
            "error"
        );
    }
}


// =========================================
// DELETE TASK
// =========================================

async function deleteTask(
    id
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await authenticatedFetch(

                `${API_URL}/${id}`,

                {
                    method: "DELETE"
                }

            );


        if (!response) {

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to delete task.",
                "error"
            );

            return;
        }


        await loadTasks(
            false
        );


        showToast(
            "Task deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Error deleting task:",
            error
        );


        showToast(
            "Unable to connect to server.",
            "error"
        );
    }
}


// =========================================
// SEARCH + FILTER
// =========================================

function applyFilters() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedStatus =
        statusFilter.value;


    const selectedPriority =
        priorityFilter.value;


    const filteredTasks =
        tasks.filter(
            task => {

                const titleMatch =
                    (
                        task.title ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            searchText
                        );


                const descriptionMatch =
                    (
                        task.description ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            searchText
                        );


                const statusMatch =
                    selectedStatus ===
                    "all" ||
                    task.status ===
                    selectedStatus;


                const priorityMatch =
                    selectedPriority ===
                    "all" ||
                    task.priority ===
                    selectedPriority;


                return (

                    (
                        titleMatch ||
                        descriptionMatch
                    )

                    &&

                    statusMatch

                    &&

                    priorityMatch

                );
            }
        );


    displayTasks(
        filteredTasks
    );
}


// =========================================
// DATE FORMAT
// =========================================

function formatDate(
    date
) {

    return new Date(
        date
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


// =========================================
// LOGOUT
// =========================================

function logout() {

    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";
}


// =========================================
// PROFILE ELEMENTS
// =========================================

const profileBtn =
    document.getElementById(
        "profileBtn"
    );


const profileDropdown =
    document.getElementById(
        "profileDropdown"
    );


const profileLogoutBtn =
    document.getElementById(
        "profileLogoutBtn"
    );


const userAvatar =
    document.getElementById(
        "userAvatar"
    );


const userName =
    document.getElementById(
        "userName"
    );


const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );


const profileName =
    document.getElementById(
        "profileName"
    );


const profileEmail =
    document.getElementById(
        "profileEmail"
    );


const profileDetailName =
    document.getElementById(
        "profileDetailName"
    );


const profileDetailEmail =
    document.getElementById(
        "profileDetailEmail"
    );


// =========================================
// LOAD USER PROFILE
// =========================================

function loadUserProfile() {

    const savedUser =
        localStorage.getItem(
            "user"
        );


    if (!savedUser) {

        return;
    }


    try {

        const user =
            JSON.parse(
                savedUser
            );


        const name =
            user.name ||
            "User";


        const email =
            user.email ||
            "No email";


        const firstLetter =
            name
                .charAt(0)
                .toUpperCase();


        if (userAvatar) {

            userAvatar.textContent =
                firstLetter;
        }


        if (userName) {

            userName.textContent =
                name;
        }


        if (profileAvatar) {

            profileAvatar.textContent =
                firstLetter;
        }


        if (profileName) {

            profileName.textContent =
                name;
        }


        if (profileEmail) {

            profileEmail.textContent =
                email;
        }


        if (profileDetailName) {

            profileDetailName.textContent =
                name;
        }


        if (profileDetailEmail) {

            profileDetailEmail.textContent =
                email;
        }


    } catch (error) {

        console.error(
            "User profile error:",
            error
        );
    }
}


// =========================================
// PROFILE DROPDOWN
// =========================================

if (
    profileBtn &&
    profileDropdown
) {

    profileBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            profileDropdown.classList.toggle(
                "hidden"
            );

        }
    );
}


// =========================================
// CLOSE PROFILE OUTSIDE CLICK
// =========================================

document.addEventListener(
    "click",
    event => {

        if (
            profileDropdown &&
            profileBtn &&
            !profileDropdown.contains(
                event.target
            ) &&
            !profileBtn.contains(
                event.target
            )
        ) {

            profileDropdown.classList.add(
                "hidden"
            );
        }
    }
);


// =========================================
// PROFILE LOGOUT
// =========================================

if (profileLogoutBtn) {

    profileLogoutBtn.addEventListener(
        "click",
        logout
    );
}


// =========================================
// EVENT LISTENERS
// =========================================

if (addTaskBtn) {

    addTaskBtn.addEventListener(
        "click",
        openAddTaskModal
    );
}


if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeModal
    );
}


if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        closeModal
    );
}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );
}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );
}


if (priorityFilter) {

    priorityFilter.addEventListener(
        "change",
        applyFilters
    );
}


// =========================================
// CLOSE MODAL OUTSIDE
// =========================================

if (taskModal) {

    taskModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                taskModal
            ) {

                closeModal();
            }
        }
    );
}


// =========================================
// ESCAPE KEY
// =========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            if (
                taskModal &&
                !taskModal.classList.contains(
                    "hidden"
                )
            ) {

                closeModal();
            }


            if (profileDropdown) {

                profileDropdown.classList.add(
                    "hidden"
                );
            }
        }
    }
);


// =========================================
// START APP
// =========================================

loadUserProfile();

loadTasks();
