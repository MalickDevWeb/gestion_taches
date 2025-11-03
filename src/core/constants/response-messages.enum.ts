export enum ResponseMessages {
  // User messages
  USER_CREATED_SUCCESSFULLY = 'Utilisateur créé avec succès',
  USER_UPDATED_SUCCESSFULLY = 'Utilisateur mis à jour avec succès',
  USER_DELETED_SUCCESSFULLY = 'Utilisateur supprimé avec succès',
  USER_NOT_FOUND = 'Utilisateur non trouvé',
  USERS_LIST = 'Liste des utilisateurs',
  USER_DETAILS = 'Détails de l\'utilisateur',

  // Task messages
  TASK_CREATED_SUCCESSFULLY = 'Tâche créée avec succès',
  TASK_UPDATED_SUCCESSFULLY = 'Tâche mise à jour avec succès',
  TASK_DELETED_SUCCESSFULLY = 'Tâche supprimée avec succès',
  TASK_NOT_FOUND = 'Tâche non trouvée',
  TASKS_LIST = 'Liste des tâches',
  TASK_DETAILS = 'Détails de la tâche',

  // Transfer messages
  TRANSFER_CREATED_SUCCESSFULLY = 'Transfert créé avec succès',
  TRANSFER_UPDATED_SUCCESSFULLY = 'Transfert mis à jour avec succès',
  TRANSFER_NOT_FOUND = 'Transfert non trouvé',
  TRANSFERS_LIST = 'Liste des transferts',
  TRANSFER_DETAILS = 'Détails du transfert',
  PROCESSING_SIMULATION_COMPLETED = 'Simulation de traitement terminée',
  AUDIT_LOGS_RETRIEVED_SUCCESSFULLY = 'Journaux d\'audit récupérés avec succès',

  // General messages
  BAD_REQUEST = 'Mauvaise requête',
  HELLO_MESSAGE = 'Message de bienvenue',

  // Error messages
  NOT_FOUND = 'Non trouvé',
}
