import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path if needed

// Assuming you have a 'tasks' table with columns: id, user_id, task_description, is_completed
function TaskList({ userId }) { // Accept userId as a prop
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [userId]); // Re-fetch tasks if userId changes

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    // Fetch tasks only for the logged-in user
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId) // Filter by user_id
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
      setTasks([]);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return; // Don't add empty tasks

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ task_description: newTask, user_id: userId, is_completed: false }]) // Include user_id
      .select(); // Select the newly inserted row

    if (error) {
      console.error('Error adding task:', error);
      setError(error.message);
    } else if (data) {
      // Add the new task to the beginning of the list
      setTasks([data[0], ...tasks]);
      setNewTask(''); // Clear the input field
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
     const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus })
      .eq('id', taskId);

     if (error) {
        console.error('Error updating task:', error);
        setError(error.message);
     } else {
        // Update the task status in the local state
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, is_completed: !currentStatus } : task
        ));
     }
  };

   const deleteTask = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
    } else {
      // Remove the task from the local state
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };


  if (loading) return <p className="text-center text-gray-500">Loading tasks...</p>;
  if (error) return <p className="text-center text-red-500">Error loading tasks: {error}</p>;

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">My Tasks</h2>
      <form onSubmit={addTask} className="flex mb-4">
        <input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
        >
          Add
        </button>
      </form>
      {tasks.length === 0 ? (
         <p className="text-center text-gray-500">No tasks yet!</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between p-2 border-b border-gray-200"
            >
              <span
                 className={`flex-grow cursor-pointer ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
                 onClick={() => toggleTaskCompletion(task.id, task.is_completed)}
              >
                {task.task_description}
              </span>
               <button
                onClick={() => deleteTask(task.id)}
                className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskList;
