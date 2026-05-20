package com.school.management.exception;

public class ResourceNotFoundException extends RuntimeException{
    /**
     * Exception levée lorsqu'une ressource demandée
     * n'existe pas dans la base de données
     */
    // Constructeur avec message

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
