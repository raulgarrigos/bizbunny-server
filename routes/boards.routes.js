const router = require("express").Router();
const Board = require("../models/Board.model");
const List = require("../models/List.model");
const Task = require("../models/Task.model");

//! ROUTES FOR BOARDS

// GET "/api/boards => To obtain all boards
router.get("/", async (req, res, next) => {
  try {
    // Obtener todos los tableros
    const boards = await Board.find();

    console.log("Boards found:", boards);

    // Verificar si no se encontraron tableros
    if (!Array.isArray(boards) || boards.length === 0) {
      console.log("Boards not found");
      return res.status(404).json({ message: "Boards not found" });
    }

    // Enviar los tableros encontrados como respuesta
    res.json(boards);
  } catch (error) {
    console.log("Error fetching boards:", error);
    next(error);
  }
});

// POST "/api/boards => To create a new board
router.post("/", async (req, res, next) => {
  const { title, description, owner } = req.body;

  try {
    // Validaciones de entrada
    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ error: "Title is required and must be a string." });
    }

    // Crear un nuevo tablero
    const newBoard = await Board.create({
      title,
      description,
      owner,
    });

    // Enviar el nuevo tablero como respuesta
    res.status(201).json(newBoard);
  } catch (error) {
    console.log("Error creating board", error);
    next(error);
  }
});

// GET "/api/boards/:boardId => To obtain details from a specific board
router.get("/:boardId", async (req, res, next) => {
  const { boardId } = req.params;

  try {
    // Buscar un tablero específico por ID
    const oneBoard = await Board.findOne({
      _id: boardId,
    });

    // Verificar si el tablero no fue encontrado
    if (!oneBoard) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Enviar el tablero encontrado como respuesta
    res.status(200).json(oneBoard);
  } catch (error) {
    console.log("Error fetching details from board", error);
    next(error);
  }
});

// PUT "/api/boards/:boardId => To edit an existing board
router.put("/:boardId", async (req, res, next) => {
  const { boardId } = req.params;
  const { title, description } = req.body;

  try {
    // Validaciones de entrada
    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ error: "Title is required and must be a string." });
    }

    // Editar un tablero existente por ID
    const oneBoard = await Board.findByIdAndUpdate(boardId, {
      title,
      description,
    });

    // Verificar si el tablero no fue encontrado
    if (!oneBoard) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Enviar el tablero editado como respuesta
    res.status(200).json(oneBoard);
  } catch (error) {
    console.log("Error editing board", error);
    next(error);
  }
});

// DELETE "/api/boards/:boardId => To delete an existing board
router.delete("/:boardId", async (req, res, next) => {
  const { boardId } = req.params;

  try {
    // Eliminar un tablero existente por ID
    await Board.findByIdAndDelete(boardId);

    // Eliminar las listas asociadas al board
    await List.deleteMany({ board: boardId });

    // Enviar mensaje de éxito como respuesta
    res.status(200).json("Board deleted");
  } catch (error) {
    console.log("Error deleting board", error);
    next(error);
  }
});

// ! ROUTES FOR LISTS

// GET "/api/boards/:boardId/lists => To obtain all lists from a board
router.get("/:boardId/lists", async (req, res, next) => {
  const { boardId } = req.params;

  try {
    // Obtener todas las listas asociadas a un tablero
    const lists = await List.find({ board: boardId });

    console.log("Lists found:", lists);

    // Verificar si no se encontraron listas
    if (!Array.isArray(lists) || lists.length === 0) {
      console.log("Lists not found");
      return res.status(404).json({ message: "Lists not found" });
    }

    // Enviar las listas encontradas como respuesta
    res.json(lists);
  } catch (error) {
    console.log("Error fetching lists:", error);
    next(error);
  }
});

// POST "/api/boards/:boardId/lists => To create a list
router.post("/:boardId/lists", async (req, res, next) => {
  const { boardId } = req.params;
  const { title } = req.body;

  try {
    // Validaciones de entrada
    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ error: "Title is required and must be a string." });
    }

    // Crear una nueva lista asociada a un tablero
    const newList = await List.create({
      title,
      board: boardId,
    });

    // Añadir la nueva lista al tablero
    await Board.findByIdAndUpdate(
      boardId,
      { $push: { lists: newList._id } },
      { new: true }
    );

    // Enviar la nueva lista como respuesta
    res.status(201).json(newList);
  } catch (error) {
    console.log("Error creating list", error);
    next(error);
  }
});

// GET "/api/:boardId/lists/:listId" => To get details form specific list
router.get(":boardId/lists/:listId", async (req, res, next) => {
  const { listId } = req.params;

  try {
    const listDetails = await List.findById(listId);

    // Verificar si la lista no fue encontrada
    if (!listDetails) {
      return res.status(404).json({ message: "List not found" });
    }

    res.json(listDetails);
  } catch (error) {
    console.log("Error fetching list details:", error);
    next(error);
  }
});

// PUT "api/boards/:boardId/lists/:listId" => Edit a specific list
router.put("/:boardId/lists/:listId", async (req, res, next) => {
  const { listId } = req.params;
  const { title } = req.body;

  try {
    // Editar una lista específica por ID
    const updatedList = await List.findByIdAndUpdate(listId, {
      title,
    });

    // Verificar si la lista no fue encontrada
    if (!updatedList) {
      return res.status(404).json({ message: "List not found" });
    }

    // Enviar la lista editada como respuesta
    res.status(200).json(updatedList);
  } catch (error) {
    console.log("Error editing list", error);
    next(error);
  }
});

// PUT "/api/boards/:boardId/lists/reorder => Reorder lists within a board
router.put("/boards/:boardId/lists/:listId/reorder", async (req, res, next) => {
  const { boardId, listId } = req.params;
  const { sourceIndex, destinationIndex } = req.body;

  console.log("Board ID:", boardId);
  console.log("List ID:", listId); // Nuevo parámetro listId
  console.log("Source Index:", sourceIndex);
  console.log("Destination Index:", destinationIndex);

  try {
    const lists = await List.find({ board: boardId });
    const reorderedLists = Array.from(lists);
    const [removedList] = reorderedLists.splice(sourceIndex, 1);
    reorderedLists.splice(destinationIndex, 0, removedList);

    for (let i = 0; i < reorderedLists.length; i++) {
      await List.findByIdAndUpdate(reorderedLists[i]._id, {
        $set: { order: i },
      });
    }

    res.status(200).json("Lists reordered successfully");
  } catch (error) {
    console.log("Error reordering lists:", error);
    next(error);
  }
});

// DELETE "api/boards/:boardId/lists/:listId" => Delete a specific list and remove from board
router.delete("/:boardId/lists/:listId", async (req, res, next) => {
  const { boardId, listId } = req.params;

  try {
    console.log("Deleting List...");
    // Eliminar una lista específica por ID
    await List.findByIdAndDelete(listId);

    console.log("Updating Board...");
    // Quitar la lista del tablero
    await Board.findByIdAndUpdate(boardId, {
      $pull: { lists: listId },
    });

    console.log("List deleted successfully");
    // Enviar mensaje de éxito como respuesta
    res.status(200).json("List deleted successfully");
  } catch (error) {
    console.log("Error deleting List", error);
    next(error);
  }
});

// ! ROUTES FOR TASKS

// GET "/api/boards/:boardId/lists/:listId/tasks => To obtain all tasks from a specific list
router.get("/:boardId/lists/:listId/tasks", async (req, res, next) => {
  const { listId } = req.params;

  try {
    // Obtener todas las tareas asociadas a una lista específica
    const tasks = await Task.find({ list: listId });

    console.log("Tasks found:", tasks);

    // Verificar si no se encontraron tareas
    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.log("Tasks not found");
      return res.status(404).json({ message: "Tasks not found" });
    }

    // Enviar las tareas encontradas como respuesta
    res.json(tasks);
  } catch (error) {
    console.log("Error fetching tasks:", error);
    next(error);
  }
});

// POST "/api/boards/:boardId/lists/:listId/tasks => To create a new task in a specific list
router.post("/:boardId/lists/:listId/tasks", async (req, res, next) => {
  const { listId } = req.params;
  const { title, description, completed } = req.body;

  try {
    // Validaciones de entrada
    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ error: "Title is required and must be a string." });
    }

    // Crear una nueva tarea asociada a una lista específica
    const newTask = await Task.create({
      title,
      description,
      completed,
      list: listId,
    });

    // Añadir la nueva tarea a la lista
    await List.findByIdAndUpdate(
      listId,
      { $push: { tasks: newTask._id } },
      { new: true }
    );

    // Enviar la nueva tarea como respuesta
    res.status(201).json(newTask);
  } catch (error) {
    console.log("Error creating task", error);
    next(error);
  }
});

// GET "/api/boards/:boardId/lists/:listId/tasks/:taskId => To obtain details from a specific task
router.get("/:boardId/lists/:listId/tasks/:taskId", async (req, res, next) => {
  const { taskId } = req.params;

  try {
    // Buscar una tarea específica por ID
    const taskDetails = await Task.findById(taskId);

    // Verificar si la tarea no fue encontrada
    if (!taskDetails) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Enviar los detalles de la tarea encontrada como respuesta
    res.status(200).json(taskDetails);
  } catch (error) {
    console.log("Error fetching task details:", error);
    next(error);
  }
});

// PUT "/api/boards/:boardId/lists/:listId/tasks/:taskId => To edit an existing task
router.put("/:boardId/lists/:listId/tasks/:taskId", async (req, res, next) => {
  const { taskId } = req.params;
  const { newListId } = req.body;

  try {
    // Actualizar la lista asociada con la tarea
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed,
      },
      { new: true }
    );

    // Verificar si la tarea no fue encontrada
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Enviar la tarea actualizada como respuesta
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log("Error updating task:", error);
    next(error);
  }
});

// DELETE "/api/boards/:boardId/lists/:listId/tasks/:taskId => To delete an existing task
router.delete(
  "/:boardId/lists/:listId/tasks/:taskId",
  async (req, res, next) => {
    const { listId, taskId } = req.params;

    try {
      // Eliminar una tarea específica por ID
      await Task.findByIdAndDelete(taskId);

      // Quitar la tarea de la lista
      await List.findByIdAndUpdate(listId, { $pull: { tasks: taskId } });

      // Enviar mensaje de éxito como respuesta
      res.status(200).json("Task deleted successfully");
    } catch (error) {
      console.log("Error deleting task", error);
      next(error);
    }
  }
);

module.exports = router;
