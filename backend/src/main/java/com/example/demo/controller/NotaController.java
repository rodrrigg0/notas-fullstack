package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Nota;
import com.example.demo.repository.NotaRepository;

@RestController 
@RequestMapping("/api/notas")
@CrossOrigin(origins = "http://localhost:5173") // puerto para React
public class NotaController {
    @Autowired NotaRepository notaRepository;

    // Obtener todas las notas
    @GetMapping 
    public List<Nota> getAllNotas() {
        return notaRepository.findAll();
    }

    //Crear una nueva Nota
    @PostMapping
    public Nota createNota(@RequestBody Nota nota){
        return notaRepository.save(nota);
    }

    //Editar una nota
    @PutMapping("/{id}")
    public ResponseEntity<Nota> updateNota(@PathVariable Long id, @RequestBody Nota notaDetalles){
        Optional<Nota> optionalNota = notaRepository.findById(id);

        if (optionalNota.isPresent()) {
            Nota nota = optionalNota.get();
            nota.setTitulo(notaDetalles.getTitulo());
            nota.setDescripcion(notaDetalles.getDescripcion());

            return ResponseEntity.ok(notaRepository.save(nota));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //Eliminar una nota
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNota(@PathVariable Long id){
        if (!notaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        notaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
