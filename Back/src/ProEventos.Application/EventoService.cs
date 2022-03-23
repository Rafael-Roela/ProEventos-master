using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ProEventos.Application.Contratos;
using ProEventos.Application.Dtos;
using ProEventos.Domain;
using ProEventos.Persistence.Contratos;

namespace ProEventos.Application
{
    public class EventoService : IEventoService
    {
        private readonly IGeralPersist _geralPersist;
        private readonly IEventoPersist _eventoPersist;
        private readonly IMapper mapper;
        public EventoService(IGeralPersist geralPersist,
                             IEventoPersist eventoPersist,
                             IMapper mapper)
        {
            _geralPersist = geralPersist;
            _eventoPersist = eventoPersist;
            this.mapper = mapper;
        }
    public async Task<EventoDto> AddEventos(int userId, EventoDto model)
    {
        try
        {
            var evento = this.mapper.Map<Evento>(model);
            evento.UserId = userId;

            _geralPersist.Add<Evento>(evento);
            if (await _geralPersist.SaveChangesAsync())
            {
                var EventoRetorno = await _eventoPersist.GetEventoByIdAsync(userId, evento.Id, false);
                return this.mapper.Map<EventoDto>(EventoRetorno);
            }
            return null;
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }
    public async Task<EventoDto> UpdateEvento(int userId, int eventoId, EventoDto model)
    {
        try{
            
            var evento = await _eventoPersist.GetEventoByIdAsync(userId, eventoId, false);
            if (evento == null) return null;

            model.Id = evento.Id;
            model.UserId = userId;
            this.mapper.Map(model, evento);

            _geralPersist.Update<Evento>(evento);
            if (await _geralPersist.SaveChangesAsync())
            {
               var EventoRetorno = await _eventoPersist.GetEventoByIdAsync(userId, evento.Id, false);
            return this.mapper.Map<EventoDto>(EventoRetorno);
            }
            return null;
        }
        catch (Exception ex)
        {
        throw new Exception(ex.Message);
        }
    }

    public async Task<bool> DeleteEvento(int userId, int eventoId)
    {
        try
        {
            var evento = await _eventoPersist.GetEventoByIdAsync(userId, eventoId, false);
            if (evento == null) throw new Exception("Evento para o delete não encontrado.");

            _geralPersist.Delete<Evento>(evento);
            return await _geralPersist.SaveChangesAsync();

        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }

    public async Task<EventoDto[]> GetAllEventosAsync(int userId, bool includePalestrantes = false)
    {
        try
        {
            var eventos = await _eventoPersist.GetAllEventosAsync(userId, includePalestrantes);
            if (eventos == null) return null;

            var resultado = this.mapper.Map<EventoDto[]>(eventos);

            return resultado;
        }
        catch (Exception ex)
        {

            throw new Exception(ex.Message);
        }
    }

    public async Task<EventoDto[]> GetAllEventosByTemaAsync(int userId, string tema, bool includePalestrantes = false)
    {
        try
        {
            var eventos = await _eventoPersist.GetAllEventosByTemaAsync(userId, tema, includePalestrantes);
            if (eventos == null) return null;

            var resultado = this.mapper.Map<EventoDto[]>(eventos);

            return resultado;
        }
        catch (Exception ex)
        {

            throw new Exception(ex.Message);
        }
    }

    public async Task<EventoDto> GetEventoByIdAsync(int userId, int eventoId, bool includePalestrantes = false)
    {
        try
        {
            var evento = await _eventoPersist.GetEventoByIdAsync(userId, eventoId, includePalestrantes);
            if (evento == null) return null;

            var resultado = this.mapper.Map<EventoDto>(evento);

            return resultado;
        }
        catch (Exception ex)
        {

            throw new Exception(ex.Message);
        }
    }

}
}